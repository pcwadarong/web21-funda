import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Quiz, Step } from '../roadmap/entities';

import { SolveLog } from './entities/solve-log.entity';
import { StepAttemptStatus, UserStepAttempt } from './entities/user-step-attempt.entity';
import { UserStepStatus } from './entities/user-step-status.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(SolveLog)
    private readonly solveLogRepository: Repository<SolveLog>,
    @InjectRepository(UserStepAttempt)
    private readonly stepAttemptRepository: Repository<UserStepAttempt>,
    @InjectRepository(UserStepStatus)
    private readonly stepStatusRepository: Repository<UserStepStatus>,
    @InjectRepository(Step)
    private readonly stepRepository: Repository<Step>,
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
  ) {}

  /**
   * 스텝 풀이를 시작하며 시도 정보를 생성한다.
   * FE는 stepId, userId, startedAt(옵션)만 넘기면 되며, attemptNo/총 퀴즈 수는 서버에서 관리한다.
   */
  async startStepAttempt(params: StartStepAttemptParams): Promise<UserStepAttempt> {
    const { userId, stepId } = params;

    const step = await this.stepRepository.findOne({ where: { id: stepId } });
    if (!step) {
      throw new NotFoundException('스텝 정보를 찾을 수 없습니다.');
    }

    const lastAttempt = await this.stepAttemptRepository.findOne({
      where: { userId, step: { id: stepId } },
      order: { attemptNo: 'DESC' },
    });
    const nextAttemptNo = (lastAttempt?.attemptNo ?? 0) + 1;
    const totalQuizzes = await this.quizRepository.count({ where: { step: { id: stepId } } });

    const attempt = this.stepAttemptRepository.create({
      userId,
      step,
      attemptNo: nextAttemptNo,
      totalQuizzes,
      answeredCount: 0,
      correctCount: 0,
      status: StepAttemptStatus.IN_PROGRESS,
      startedAt: new Date(),
    });

    return this.stepAttemptRepository.save(attempt);
  }

  /**
   * 스텝 풀이 완료 처리
   * - 최근 진행 중(in_progress) 시도를 기준으로 점수를 계산하고 상태를 완료로 업데이트한다.
   * - 응답에는 획득 점수=경험치, 정답 수, 풀이 수, 성공률, 소요 시간을 포함한다.
   */
  async completeStepAttempt(params: CompleteStepAttemptParams): Promise<CompleteStepAttemptResult> {
    const { userId, stepId, stepAttemptId } = params;

    const step = await this.stepRepository.findOne({ where: { id: stepId } });
    if (!step) {
      throw new NotFoundException('스텝 정보를 찾을 수 없습니다.');
    }

    const attempt = await this.findTargetStepAttempt({ userId, stepId, stepAttemptId });

    if (!attempt) {
      throw new BadRequestException('진행 중인 스텝 시도를 찾을 수 없습니다.');
    }

    const targetStepAttemptId = attempt.id;
    const solveLogs = await this.solveLogRepository.find({
      where: { stepAttempt: { id: targetStepAttemptId } },
    });

    const scoreResult = await this.calculateStepAttemptScore(targetStepAttemptId);
    const finishedAtDate = new Date();
    const durationSeconds = Math.max(
      0,
      Math.floor((finishedAtDate.getTime() - attempt.startedAt.getTime()) / 1000),
    );

    const successRate =
      attempt.totalQuizzes === 0 ? 0 : (scoreResult.correctCount / attempt.totalQuizzes) * 100;

    attempt.answeredCount = solveLogs.length;
    attempt.correctCount = scoreResult.correctCount;
    attempt.successRate = successRate;
    attempt.status = StepAttemptStatus.COMPLETED;
    attempt.finishedAt = finishedAtDate;
    attempt.totalQuizzes = attempt.totalQuizzes ?? scoreResult.totalQuizzes;

    await this.stepAttemptRepository.save(attempt);

    const stepStatus = await this.stepStatusRepository.findOne({
      where: { userId, step: { id: stepId } },
    });

    if (stepStatus) {
      stepStatus.isCompleted = true;
      stepStatus.bestScore =
        stepStatus.bestScore === null || stepStatus.bestScore === undefined
          ? scoreResult.score
          : Math.max(stepStatus.bestScore, scoreResult.score);
      stepStatus.successRate = successRate;
      await this.stepStatusRepository.save(stepStatus);
    } else {
      const newStatus = this.stepStatusRepository.create({
        userId,
        step,
        isCompleted: true,
        bestScore: scoreResult.score,
        successRate,
      });
      await this.stepStatusRepository.save(newStatus);
    }

    return {
      score: scoreResult.score,
      experience: scoreResult.score,
      correctCount: scoreResult.correctCount,
      totalQuizzes: attempt.totalQuizzes,
      answeredQuizzes: solveLogs.length,
      successRate,
      durationSeconds,
      // TODO: 오늘의 첫풀이여부 부탁드립니다
      firstSolve: false,
    };
  }

  /**
   * 완료 처리 대상 스텝 시도를 찾는다.
   * - 클라이언트가 명시한 stepAttemptId를 우선 사용한다.
   * - 없으면 최신 진행 중(in_progress) 시도를 반환한다.
   */
  private async findTargetStepAttempt(params: {
    userId: number;
    stepId: number;
    stepAttemptId?: number;
  }): Promise<UserStepAttempt | null> {
    const { userId, stepId, stepAttemptId } = params;

    if (stepAttemptId) {
      return this.stepAttemptRepository.findOne({
        where: {
          id: stepAttemptId,
          userId,
          step: { id: stepId },
          status: StepAttemptStatus.IN_PROGRESS,
        },
      });
    }

    return this.stepAttemptRepository.findOne({
      where: { userId, step: { id: stepId }, status: StepAttemptStatus.IN_PROGRESS },
      order: { attemptNo: 'DESC' },
    });
  }

  /**
   * 스텝 시도에 해당하는 퀴즈 풀이 로그를 기반으로 점수를 계산한다.
   * @param stepAttemptId 계산 대상 스텝 시도 ID
   * @param options 점수 가중치 설정(없으면 기본값 사용)
   */
  async calculateStepAttemptScore(
    stepAttemptId: number,
    options?: Partial<ScoreCalculationOptions>,
  ): Promise<StepAttemptScore> {
    const weights = this.mergeScoreWeights(options);

    const logs = await this.solveLogRepository.find({
      where: { stepAttempt: { id: stepAttemptId } },
    });

    if (logs.length === 0) {
      return {
        score: 0,
        correctCount: 0,
        totalQuizzes: 0,
        successRate: 0,
      };
    }

    const totalQuizzes = logs.length;
    const correctCount = logs.filter(log => log.isCorrect).length;

    // 기본 3점 + 보너스(확장 시)
    const score = logs.reduce((accumulator, log) => {
      const baseScore = weights.baseScorePerQuiz;
      // TODO: 추후 난이도/시간/정답 가중치 반영 시 아래 보너스 값을 채운다.
      // correctBonus가 현재는 0점
      const correctnessBonus = log.isCorrect ? weights.correctBonus : weights.wrongBonus;
      const difficultyBonus = 0; // weights.difficultyMultiplier * (log.quiz?.difficulty ?? 0);
      const speedBonus = 0; // 시간 기반 보너스/페널티

      return accumulator + baseScore + correctnessBonus + difficultyBonus + speedBonus;
    }, 0);

    const successRate = totalQuizzes === 0 ? 0 : (correctCount / totalQuizzes) * 100;

    return {
      score,
      correctCount,
      totalQuizzes,
      successRate,
    };
  }

  private mergeScoreWeights(options?: Partial<ScoreCalculationOptions>): ScoreCalculationOptions {
    return {
      baseScorePerQuiz: 3,
      correctBonus: 0,
      wrongBonus: 0,
      difficultyMultiplier: 0,
      speedBonus: 0,
      ...(options ?? {}),
    };
  }

  /**
   * 비로그인 상태에서 푼 step들을 로그인 후 동기화한다.
   * 이미 존재하는 stepId는 건너뛴다.
   */
  async syncStepStatuses(userId: number, stepIds: number[]): Promise<{ syncedCount: number }> {
    let syncedCount = 0;

    for (const stepId of stepIds) {
      const existing = await this.stepStatusRepository.findOne({
        where: { userId, step: { id: stepId } },
      });

      if (existing) {
        continue;
      }

      const step = await this.stepRepository.findOne({ where: { id: stepId } });
      if (!step) {
        continue;
      }

      const newStatus = this.stepStatusRepository.create({
        userId,
        step,
        isCompleted: true,
        bestScore: null,
        successRate: null,
      });
      await this.stepStatusRepository.save(newStatus);
      syncedCount++;
    }

    return { syncedCount };
  }
}

export interface ScoreCalculationOptions {
  baseScorePerQuiz: number;
  correctBonus: number;
  wrongBonus: number;
  difficultyMultiplier: number;
  speedBonus: number;
}

export interface StepAttemptScore {
  score: number;
  correctCount: number;
  totalQuizzes: number;
  successRate: number;
}

export interface StartStepAttemptParams {
  userId: number;
  stepId: number;
}

export interface CompleteStepAttemptParams {
  userId: number;
  stepId: number;
  stepAttemptId?: number;
}

export interface CompleteStepAttemptResult {
  score: number;
  experience: number;
  correctCount: number;
  totalQuizzes: number | null | undefined;
  answeredQuizzes: number;
  successRate: number;
  durationSeconds: number;
  firstSolve: boolean;
}
