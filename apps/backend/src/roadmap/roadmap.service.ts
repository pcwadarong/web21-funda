import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { FieldUnitsResponse } from './dto/field-units.dto';
import type { QuizContent, QuizResponse } from './dto/quiz-list.dto';
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
  ) {}

  /**
   * 필드 슬러그 기준으로 유닛/스텝과 퀴즈 개수를 조회한다.
   * @param fieldSlug 필드 슬러그
   * @returns 필드와 유닛/스텝 정보
   */
  async getUnitsByFieldSlug(fieldSlug: string): Promise<FieldUnitsResponse> {
    const field = await this.fieldRepository.findOne({
      where: { slug: fieldSlug },
      relations: { units: { steps: true } }, // 유닛과 스텝까지 함께 로딩
    });

    if (!field) {
      throw new NotFoundException('Field not found.'); // 존재하지 않으면 404
    }

    const units = field.units ?? [];
    const steps = units.flatMap(unit => unit.steps ?? []);
    const quizCountByStepId = await this.getQuizCountByStepId(steps.map(step => step.id));

    return this.buildFieldUnitsResponse(field, units, quizCountByStepId);
  }

  /**
   * 스텝 ID 기준으로 퀴즈 목록을 조회한다.
   * @param stepId 스텝 ID
   * @returns 퀴즈 목록
   */
  async getQuizzesByStepId(stepId: number): Promise<QuizResponse[]> {
    const step = await this.stepRepository.findOne({
      where: { id: stepId },
      select: { id: true },
    });

    if (!step) {
      throw new NotFoundException('Step not found.'); // 스텝이 없으면 404
    }

    const quizzes = await this.quizRepository.find({
      where: { step: { id: stepId } },
      order: { id: 'ASC' },
    });

    return quizzes.map(quiz => this.toQuizResponse(quiz));
  }

  /**
   * stepId별 퀴즈 개수를 조회해 Map으로 반환한다.
   * @param stepIds 스텝 ID 목록
   * @returns stepId -> quizCount 매핑
   */
  private async getQuizCountByStepId(stepIds: number[]): Promise<Map<number, number>> {
    if (stepIds.length === 0) {
      return new Map();
    }

    const quizCounts = await this.quizRepository
      .createQueryBuilder('quiz')
      .select('quiz.step_id', 'stepId')
      .addSelect('COUNT(quiz.id)', 'quizCount') // step별 퀴즈 개수
      .where('quiz.step_id IN (:...stepIds)', { stepIds })
      .groupBy('quiz.step_id') // step_id 기준 그룹화
      .getRawMany<{ stepId: number; quizCount: string }>(); // 엔티티가 아닌 raw row 반환

    return new Map(quizCounts.map(row => [Number(row.stepId), Number(row.quizCount)]));
  }

  /**
   * 퀴즈 엔티티를 응답 DTO로 변환한다.
   * @param quiz 퀴즈 엔티티
   * @returns 퀴즈 응답 DTO
   */
  private toQuizResponse(quiz: Quiz): QuizResponse {
    return {
      id: quiz.id,
      type: quiz.type,
      content: this.normalizeQuizContent(quiz),
    };
  }

  /**
   * 퀴즈 content를 안전하게 정규화한다.
   * @param quiz 퀴즈 엔티티
   * @returns 정규화된 content
   */
  private normalizeQuizContent(quiz: Quiz): QuizContent {
    const rawObject = this.toContentObject(quiz.content);
    if (!rawObject) {
      return { question: quiz.question };
    }

    const question =
      typeof rawObject.question === 'string' && rawObject.question.trim().length > 0
        ? rawObject.question
        : quiz.question;

    const options = this.normalizeOptions(rawObject.options);
    const codeMetadata = this.normalizeCodeMetadata(rawObject);
    const matchingMetadata = this.normalizeMatchingMetadata(rawObject);

    return {
      question,
      ...(options ? { options } : {}),
      ...(codeMetadata ? { code_metadata: codeMetadata } : {}),
      ...(matchingMetadata ? { matching_metadata: matchingMetadata } : {}),
    };
  }

  /**
   * options 값을 QuizOption[] 형태로 정규화한다.
   * @param value 원본 options 값
   * @returns 정규화된 options (없으면 undefined)
   */
  private normalizeOptions(value: unknown) {
    if (!Array.isArray(value)) return undefined;

    const options = value
      .map(option => {
        if (!this.isPlainObject(option)) return null;
        const item = option as Record<string, unknown>;
        const id = item.id;
        const text = item.text;
        if ((typeof id === 'string' || typeof id === 'number') && typeof text === 'string') {
          return { id: String(id), text };
        }
        return null;
      })
      .filter((opt): opt is { id: string; text: string } => opt !== null);

    return options.length > 0 ? options : undefined;
  }

  /**
   * content raw 값을 객체로 변환한다(문자열 JSON도 허용).
   * @param raw content 원본 값
   * @returns content 객체 (없으면 null)
   */
  private toContentObject(raw: unknown): Record<string, unknown> | null {
    if (this.isPlainObject(raw)) {
      return raw;
    }

    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (this.isPlainObject(parsed)) {
          return parsed;
        }
      } catch {
        return null;
      }
    }

    return null;
  }

  /**
   * CODE 타입 메타데이터를 content의 최상위 code/language로부터 정규화한다.
   * @param value content 객체
   * @returns 정규화된 code_metadata (없으면 undefined)
   */
  private normalizeCodeMetadata(value: Record<string, unknown>) {
    const code = value.code;
    const language = value.language;
    if (typeof code === 'string') {
      return typeof language === 'string' ? { language, snippet: code } : { snippet: code };
    }
    return undefined;
  }

  /**
   * MATCHING 타입 메타데이터를 정규화한다.
   * @param value matching_metadata 원본 값
   * @returns 정규화된 matching_metadata (없으면 undefined)
   */
  private normalizeMatchingMetadata(value: unknown) {
    if (!this.isPlainObject(value)) return undefined;

    const item = value as Record<string, unknown>;
    const left = this.toStringArray(item.left);
    const right = this.toStringArray(item.right);

    if (left.length > 0 && right.length > 0) {
      return { left, right };
    }
    return undefined;
  }

  /**
   * 엔티티를 응답 DTO 형태로 변환한다.
   * @param field 필드 엔티티
   * @param units 유닛 엔티티 목록
   * @param quizCountByStepId stepId -> quizCount 매핑
   * @returns 응답 DTO
   */
  private buildFieldUnitsResponse(
    field: Field,
    units: NonNullable<Field['units']> = [],
    quizCountByStepId: Map<number, number>,
  ): FieldUnitsResponse {
    return {
      field: {
        name: field.name,
        slug: field.slug,
      },
      units: this.sortByOrderIndex(units).map(unit => ({
        id: unit.id,
        title: unit.title,
        orderIndex: unit.orderIndex,
        steps: this.sortByOrderIndex(unit.steps ?? []).map(step => ({
          id: step.id,
          title: step.title,
          orderIndex: step.orderIndex,
          quizCount: quizCountByStepId.get(step.id) ?? 0,
          isCheckpoint: step.isCheckpoint,
          isCompleted: false,
          isLocked: false,
        })),
      })),
    };
  }

  /**
   * 객체가 일반 객체인지 확인한다.
   * @param value 검사할 값
   * @returns plain object 여부
   */
  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * 문자열 배열인지 확인한다.
   * @param value 검사할 값
   * @returns 문자열 배열 여부
   */
  private isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(item => typeof item === 'string');
  }

  /**
   * 배열 값을 문자열 배열로 변환한다.
   * @param value 변환할 값
   * @returns 문자열 배열(유효하지 않으면 빈 배열)
   */
  private toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
      .map(item => {
        if (typeof item === 'string') return item;
        if (item === null || item === undefined) return null;
        return String(item);
      })
      .filter((v): v is string => typeof v === 'string');
  }

  /**
   * orderIndex 기준으로 오름차순 정렬한다.
   * @param items 정렬할 항목 목록
   * @returns 정렬된 항목 목록
   */
  private sortByOrderIndex<T extends { orderIndex: number }>(items: T[]): T[] {
    return [...items].sort((a, b) => a.orderIndex - b.orderIndex);
  }
}
