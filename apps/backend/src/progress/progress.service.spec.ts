import { Repository } from 'typeorm';

import { SolveLog } from './entities/solve-log.entity';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  let service: ProgressService;
  let solveLogRepository: Partial<Repository<SolveLog>>;
  let findMock: jest.Mock;

  beforeEach(() => {
    findMock = jest.fn();
    solveLogRepository = {
      find: findMock,
    };

    service = new ProgressService(solveLogRepository as Repository<SolveLog>);
  });

  it('풀이 로그가 없으면 점수와 통계가 0이다', async () => {
    findMock.mockResolvedValue([]);

    const result = await service.calculateStepAttemptScore(1);

    expect(findMock).toHaveBeenCalledWith({ where: { stepAttemptId: 1 } });
    expect(result).toEqual({
      score: 0,
      correctCount: 0,
      totalQuizzes: 0,
      successRate: 0,
    });
  });

  it('문제당 기본 점수와 정답/오답 보너스를 합산한다', async () => {
    findMock.mockResolvedValue([
      { isCorrect: true },
      { isCorrect: false },
      { isCorrect: true },
    ] as SolveLog[]);

    const result = await service.calculateStepAttemptScore(2, {
      baseScorePerQuiz: 3,
      correctBonus: 2,
      wrongBonus: -1,
    });

    // 점수 계산: (3+2) + (3-1) + (3+2) = 12
    expect(result.score).toBe(12);
    expect(result.correctCount).toBe(2);
    expect(result.totalQuizzes).toBe(3);
    expect(result.successRate).toBeCloseTo((2 / 3) * 100);
  });
});
