import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SolveLog } from './entities/solve-log.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(SolveLog)
    private readonly solveLogRepository: Repository<SolveLog>,
  ) {}

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
      where: { stepAttemptId },
    });

    if (logs.length === 0) {
      return {
        score: 0,
        correctCount: 0,
        totalQuestions: 0,
        successRate: 0,
      };
    }

    const totalQuestions = logs.length;
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

    const successRate = totalQuestions === 0 ? 0 : (correctCount / totalQuestions) * 100;

    return {
      score,
      correctCount,
      totalQuestions,
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
  totalQuestions: number;
  successRate: number;
}
