import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CodeFormatter } from '../common/utils/code-formatter';
import { SolveLog, UserStepAttempt } from '../progress/entities';

import type { FieldListResponse } from './dto/field-list.dto';
import type { FieldRoadmapResponse } from './dto/field-roadmap.dto';
import type { FieldUnitsResponse } from './dto/field-units.dto';
import type { FirstUnitResponse } from './dto/first-unit.dto';
import type { QuizResponse } from './dto/quiz-list.dto';
import type { QuizSubmissionRequest, QuizSubmissionResponse } from './dto/quiz-submission.dto';
import { Field, Quiz, Step } from './entities';

@Injectable()
export class RoadmapService {
  constructor(
    @InjectRepository(Field)
    private readonly fieldRepository: Repository<Field>,
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(Step)
    private readonly stepRepository: Repository<Step>,
    @InjectRepository(SolveLog)
    private readonly solveLogRepository: Repository<SolveLog>,
    @InjectRepository(UserStepAttempt)
    private readonly stepAttemptRepository: Repository<UserStepAttempt>,
    private readonly codeFormatter: CodeFormatter,
  ) {}

  async getFields(): Promise<FieldListResponse> {
    const fields = await this.fieldRepository.find({
      select: ['slug', 'name', 'description'],
    });

    return {
      fields: fields.map(field => ({
        slug: field.slug,
        name: field.name,
        description: field.description ?? null,
      })),
    };
  }

  async getRoadmapByFieldSlug(fieldSlug: string): Promise<FieldRoadmapResponse> {
    const field = await this.fieldRepository
      .createQueryBuilder('field')
      .leftJoinAndSelect('field.units', 'unit')
      .where('field.slug = :slug', { slug: fieldSlug })
      .orderBy('unit.orderIndex', 'ASC')
      .getOne();

    if (!field) {
      throw new NotFoundException('필드를 찾을 수 없습니다.');
    }

    return {
      field: { name: field.name, slug: field.slug },
      units: (field.units || []).map(unit => ({
        id: unit.id,
        title: unit.title,
        orderIndex: unit.orderIndex,
      })),
    };
  }

  async getFirstUnitByFieldSlug(fieldSlug: string): Promise<FirstUnitResponse> {
    const field = await this.fieldRepository
      .createQueryBuilder('field')
      .leftJoinAndSelect('field.units', 'unit')
      .leftJoinAndSelect('unit.steps', 'step')
      .where('field.slug = :slug', { slug: fieldSlug })
      .orderBy('unit.orderIndex', 'ASC')
      .addOrderBy('step.orderIndex', 'ASC')
      .getOne();

    if (!field) {
      throw new NotFoundException('필드를 찾을 수 없습니다.');
    }

    const firstUnit = field.units?.[0];
    if (!firstUnit) {
      return {
        field: { name: field.name, slug: field.slug },
        unit: null,
      };
    }

    const stepIds = (firstUnit.steps || []).map(step => step.id);
    const quizCounts = await this.quizRepository
      .createQueryBuilder('quiz')
      .select('quiz.stepId', 'stepId')
      .addSelect('COUNT(*)', 'quizCount')
      .where('quiz.stepId IN (:...stepIds)', { stepIds })
      .groupBy('quiz.stepId')
      .getRawMany();

    const quizCountMap = new Map<number, number>();
    for (const row of quizCounts) {
      quizCountMap.set(Number(row.stepId), Number(row.quizCount));
    }

    const steps = this.buildStepsWithPlaceholders(firstUnit.steps || [], quizCountMap);

    return {
      field: { name: field.name, slug: field.slug },
      unit: {
        id: firstUnit.id,
        title: firstUnit.title,
        orderIndex: firstUnit.orderIndex,
        steps,
      },
    };
  }

  async getUnitsByFieldSlug(fieldSlug: string): Promise<FieldUnitsResponse> {
    const field = await this.fieldRepository.findOne({
      where: { slug: fieldSlug },
      relations: ['units', 'units.steps'],
    });

    if (!field) {
      throw new NotFoundException('필드를 찾을 수 없습니다.');
    }

    const allStepIds: number[] = [];
    for (const unit of field.units || []) {
      for (const step of unit.steps || []) {
        allStepIds.push(step.id);
      }
    }

    const quizCounts = await this.quizRepository
      .createQueryBuilder('quiz')
      .select('quiz.stepId', 'stepId')
      .addSelect('COUNT(*)', 'quizCount')
      .where('quiz.stepId IN (:...stepIds)', { stepIds: allStepIds })
      .groupBy('quiz.stepId')
      .getRawMany();

    const quizCountMap = new Map<number, number>();
    for (const row of quizCounts) {
      quizCountMap.set(Number(row.stepId), Number(row.quizCount));
    }

    const units = (field.units || [])
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(unit => ({
        id: unit.id,
        title: unit.title,
        orderIndex: unit.orderIndex,
        steps: this.buildStepsWithPlaceholders(
          (unit.steps || []).sort((a, b) => a.orderIndex - b.orderIndex),
          quizCountMap,
        ),
      }));

    return {
      field: { name: field.name, slug: field.slug },
      units,
    };
  }

  async getQuizzesByStepId(stepId: number): Promise<QuizResponse[]> {
    const step = await this.stepRepository.findOne({ where: { id: stepId } });
    if (!step) {
      throw new NotFoundException('스텝을 찾을 수 없습니다.');
    }

    const quizzes = await this.quizRepository.find({
      where: { step: { id: stepId } },
      order: { id: 'ASC' },
    });

    const result: QuizResponse[] = [];

    for (const quiz of quizzes) {
      const content = quiz.content as Record<string, unknown>;
      const quizResponse: QuizResponse = {
        id: quiz.id,
        type: quiz.type,
        content: {
          question: quiz.question,
        },
      };

      if (quiz.type === 'MCQ' || quiz.type === 'CODE') {
        if (typeof content === 'object' && content !== null) {
          quizResponse.content.options = content.options as QuizResponse['content']['options'];
        }

        if (quiz.type === 'CODE') {
          let codeContent: { code?: string; language?: string; options?: unknown } = {};
          if (typeof content === 'string') {
            try {
              codeContent = JSON.parse(content);
            } catch {
              codeContent = {};
            }
          } else if (typeof content === 'object' && content !== null) {
            codeContent = content as { code?: string; language?: string; options?: unknown };
          }

          const code = codeContent.code || '';
          const language = codeContent.language || 'html';
          const formattedCode = await this.codeFormatter.format(code, language);

          quizResponse.content.options = codeContent.options as QuizResponse['content']['options'];
          quizResponse.content.code_metadata = {
            snippet: formattedCode,
            language,
          };
        }
      } else if (quiz.type === 'MATCHING') {
        if (typeof content === 'object' && content !== null) {
          quizResponse.content.matching_metadata = {
            left: (content.left as string[]) || [],
            right: (content.right as string[]) || [],
          };
        }
      }

      result.push(quizResponse);
    }

    return result;
  }

  async submitQuiz(
    quizId: number,
    payload: QuizSubmissionRequest,
    userId: number | null,
  ): Promise<QuizSubmissionResponse> {
    const quiz = await this.quizRepository.findOne({ where: { id: quizId } });
    if (!quiz) {
      throw new NotFoundException('퀴즈를 찾을 수 없습니다.');
    }

    let isCorrect = false;
    const answer = quiz.answer as Record<string, unknown>;

    if (quiz.type === 'MCQ') {
      const correctOptionId = (answer.value as string) || '';
      const selectedOptionId = payload.selection.option_id || '';
      isCorrect = correctOptionId === selectedOptionId;
    } else if (quiz.type === 'MATCHING') {
      const correctPairs = (answer.pairs as Array<{ left: string; right: string }>) || [];
      const submittedPairs = payload.selection.pairs || [];

      if (correctPairs.length === 0 && submittedPairs.length === 0) {
        isCorrect = true;
      } else if (submittedPairs.length === 0) {
        isCorrect = false;
      } else {
        isCorrect = true;
        for (const submittedPair of submittedPairs) {
          const found = correctPairs.find(
            p => p.left === submittedPair.left && p.right === submittedPair.right,
          );
          if (!found) {
            isCorrect = false;
            break;
          }
        }
      }
    }

    if (userId !== null) {
      const solveLog = this.solveLogRepository.create({
        userId,
        quiz,
        stepAttempt: payload.step_attempt_id
          ? ({ id: payload.step_attempt_id } as UserStepAttempt)
          : null,
        isCorrect,
        solvedAt: new Date(),
      });
      await this.solveLogRepository.save(solveLog);
    }

    const response: QuizSubmissionResponse = {
      quiz_id: quizId,
      is_correct: isCorrect,
      solution: {},
    };

    if (quiz.type === 'MCQ') {
      response.solution.correct_option_id = (answer.value as string) || '';
    } else if (quiz.type === 'MATCHING') {
      response.solution.correct_pairs =
        (answer.pairs as Array<{ left: string; right: string }>) || [];
    }

    response.solution.explanation = quiz.explanation || null;

    return response;
  }

  private buildStepsWithPlaceholders(
    steps: Step[],
    quizCountMap: Map<number, number>,
  ): Array<{
    id: number;
    title: string;
    orderIndex: number;
    quizCount: number;
    isCheckpoint: boolean;
    isCompleted: boolean;
    isLocked: boolean;
  }> {
    const result: Array<{
      id: number;
      title: string;
      orderIndex: number;
      quizCount: number;
      isCheckpoint: boolean;
      isCompleted: boolean;
      isLocked: boolean;
    }> = [];

    const maxSteps = 5;
    const allSteps = steps.sort((a, b) => a.orderIndex - b.orderIndex);
    const checkpointSteps = allSteps.filter(step => step.isCheckpoint);

    const totalSteps = allSteps.length;
    const stepsToShow = Math.min(totalSteps, maxSteps);

    for (let i = 0; i < maxSteps; i++) {
      if (i < stepsToShow) {
        const step = allSteps[i];
        if (step) {
          result.push({
            id: step.id,
            title: step.title,
            orderIndex: step.orderIndex,
            quizCount: quizCountMap.get(step.id) || 0,
            isCheckpoint: step.isCheckpoint,
            isCompleted: false,
            isLocked: false,
          });
        }
      } else {
        result.push({
          id: -1,
          title: '',
          orderIndex: i + 1,
          quizCount: 0,
          isCheckpoint: false,
          isCompleted: false,
          isLocked: true,
        });
      }
    }

    if (checkpointSteps.length >= 2) {
      const midCheckpoint = checkpointSteps[0];
      const finalCheckpoint = checkpointSteps[checkpointSteps.length - 1];
      if (midCheckpoint && !result.find(s => s.id === midCheckpoint.id)) {
        result.push({
          id: midCheckpoint.id,
          title: midCheckpoint.title,
          orderIndex: midCheckpoint.orderIndex,
          quizCount: quizCountMap.get(midCheckpoint.id) || 0,
          isCheckpoint: true,
          isCompleted: false,
          isLocked: false,
        });
      }
      if (finalCheckpoint && !result.find(s => s.id === finalCheckpoint.id)) {
        result.push({
          id: finalCheckpoint.id,
          title: finalCheckpoint.title,
          orderIndex: finalCheckpoint.orderIndex,
          quizCount: quizCountMap.get(finalCheckpoint.id) || 0,
          isCheckpoint: true,
          isCompleted: false,
          isLocked: false,
        });
      }
    } else if (checkpointSteps.length === 1) {
      const checkpoint = checkpointSteps[0];
      if (checkpoint) {
        const checkpointInResult = result.find(s => s.id === checkpoint.id);
        if (!checkpointInResult) {
          result.push({
            id: -1,
            title: '중간 점검',
            orderIndex: maxSteps + 1,
            quizCount: 0,
            isCheckpoint: true,
            isCompleted: false,
            isLocked: true,
          });
          result.push({
            id: checkpoint.id,
            title: checkpoint.title,
            orderIndex: checkpoint.orderIndex,
            quizCount: quizCountMap.get(checkpoint.id) || 0,
            isCheckpoint: true,
            isCompleted: false,
            isLocked: false,
          });
        } else {
          result.push({
            id: -1,
            title: '중간 점검',
            orderIndex: maxSteps + 1,
            quizCount: 0,
            isCheckpoint: true,
            isCompleted: false,
            isLocked: true,
          });
        }
      }
      result.push({
        id: -1,
        title: '최종 점검',
        orderIndex: maxSteps + 2,
        quizCount: 0,
        isCheckpoint: true,
        isCompleted: false,
        isLocked: true,
      });
    } else {
      result.push({
        id: -1,
        title: '중간 점검',
        orderIndex: maxSteps + 1,
        quizCount: 0,
        isCheckpoint: true,
        isCompleted: false,
        isLocked: true,
      });
      result.push({
        id: -1,
        title: '최종 점검',
        orderIndex: maxSteps + 2,
        quizCount: 0,
        isCheckpoint: true,
        isCompleted: false,
        isLocked: true,
      });
    }

    return result.sort((a, b) => a.orderIndex - b.orderIndex);
  }
}
