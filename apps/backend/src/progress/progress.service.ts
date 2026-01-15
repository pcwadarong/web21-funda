import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Quiz, Step } from '../roadmap/entities';
import { User } from '../users/entities';

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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
    if (!step) throw new NotFoundException('스텝 정보를 찾을 수 없습니다.');

    const attempt = await this.findTargetStepAttempt({ userId, stepId, stepAttemptId });
    if (!attempt) throw new BadRequestException('진행 중인 스텝 시도를 찾을 수 없습니다.');

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

    const gainedExperience = scoreResult.score;
    if (gainedExperience > 0) {
      // 스텝 완료 시 획득한 점수를 경험치로 누적한다.
      await this.userRepository.increment({ id: userId }, 'experience', gainedExperience);
    }

    const { isFirstSolveToday, currentStreak } = await this.handleUserStreak(params.userId);

    return {
      score: scoreResult.score,
      experience: scoreResult.score,
      correctCount: scoreResult.correctCount,
      totalQuizzes: attempt.totalQuizzes,
      answeredQuizzes: solveLogs.length,
      successRate,
      durationSeconds,
      isFirstSolveToday,
      currentStreak,
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

    // 동기화된 step 수만큼 experience 추가 (step당 30 경험치)
    if (syncedCount > 0) {
      await this.userRepository.increment({ id: userId }, 'experience', syncedCount * 30);
    }

    return { syncedCount };
  }

  /**
   * 유저의 스트릭을 관리하고 오늘의 첫 풀이 여부를 확인한다.
   */
  private async handleUserStreak(
    userId: number,
  ): Promise<{ isFirstSolveToday: boolean; currentStreak: number }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    const now = new Date();

    // 날짜 비교를 위한 헬퍼 (서버 타임존 기준 YYYY-MM-DD)
    const formatDate = (d: Date): string => d.toISOString().split('T')[0]!;

    const todayStr: string = formatDate(now);
    const lastUpdateStr: string | null = user.lastStreakUpdatedAt
      ? formatDate(user.lastStreakUpdatedAt)
      : null;

    // 오늘 이미 풀었다면 스트릭 갱신 없이 종료
    if (lastUpdateStr === todayStr)
      return { isFirstSolveToday: false, currentStreak: user.currentStreak };

    // 날짜 차이 계산
    let nextStreak = 1;
    if (lastUpdateStr) {
      const lastDate = new Date(lastUpdateStr);
      const todayDate = new Date(todayStr);

      // 밀리세컨드 차이를 일 단위로 변환
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) nextStreak = user.currentStreak + 1;
      else nextStreak = 1;
    }

    user.currentStreak = nextStreak;
    user.lastStreakUpdatedAt = now;
    await this.userRepository.save(user);

    return { isFirstSolveToday: true, currentStreak: nextStreak };
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
  isFirstSolveToday: boolean;
  currentStreak: number;
}
