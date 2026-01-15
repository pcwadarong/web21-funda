import { Repository } from 'typeorm';

import { Quiz, Step } from '../roadmap/entities';
import { User } from '../users/entities';

import { SolveLog } from './entities/solve-log.entity';
import { StepAttemptStatus, UserStepAttempt } from './entities/user-step-attempt.entity';
import { UserStepStatus } from './entities/user-step-status.entity';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  let service: ProgressService;
  let solveLogRepository: Partial<Repository<SolveLog>>;
  let stepAttemptRepository: Partial<Repository<UserStepAttempt>>;
  let stepStatusRepository: Partial<Repository<UserStepStatus>>;
  let stepRepository: Partial<Repository<Step>>;
  let quizRepository: Partial<Repository<Quiz>>;
  let userRepository: Partial<Repository<User>>;
  let solveLogFindMock: jest.Mock;
  let stepAttemptFindOneMock: jest.Mock;
  let stepAttemptSaveMock: jest.Mock;
  let stepAttemptCreateMock: jest.Mock;
  let stepStatusFindOneMock: jest.Mock;
  let stepStatusSaveMock: jest.Mock;
  let stepStatusCreateMock: jest.Mock;
  let stepFindOneMock: jest.Mock;
  let quizCountMock: jest.Mock;
  let userIncrementMock: jest.Mock;

  beforeEach(() => {
    solveLogFindMock = jest.fn();
    stepAttemptFindOneMock = jest.fn();
    stepAttemptSaveMock = jest.fn();
    stepAttemptCreateMock = jest.fn(entity => entity);
    stepStatusFindOneMock = jest.fn();
    stepStatusSaveMock = jest.fn();
    stepStatusCreateMock = jest.fn(entity => entity);
    stepFindOneMock = jest.fn().mockResolvedValue({ id: 1 } as Step);
    quizCountMock = jest.fn().mockResolvedValue(0);
    userIncrementMock = jest.fn().mockResolvedValue({});

    solveLogRepository = {
      find: solveLogFindMock,
    };
    stepAttemptRepository = {
      findOne: stepAttemptFindOneMock,
      save: stepAttemptSaveMock,
      create: stepAttemptCreateMock,
    };
    stepStatusRepository = {
      findOne: stepStatusFindOneMock,
      save: stepStatusSaveMock,
      create: stepStatusCreateMock,
    };
    stepRepository = {
      findOne: stepFindOneMock,
    };
    quizRepository = {
      count: quizCountMock,
    };
    userRepository = {
      increment: userIncrementMock,
    };

    service = new ProgressService(
      solveLogRepository as Repository<SolveLog>,
      stepAttemptRepository as Repository<UserStepAttempt>,
      stepStatusRepository as Repository<UserStepStatus>,
      stepRepository as Repository<Step>,
      quizRepository as Repository<Quiz>,
      userRepository as Repository<User>,
    );
  });

  it('풀이 로그가 없으면 점수와 통계가 0이다', async () => {
    solveLogFindMock.mockResolvedValue([]);

    const result = await service.calculateStepAttemptScore(1);

    expect(solveLogFindMock).toHaveBeenCalledWith({ where: { stepAttemptId: 1 } });
    expect(result).toEqual({
      score: 0,
      correctCount: 0,
      totalQuizzes: 0,
      successRate: 0,
    });
  });

  it('문제당 기본 점수와 정답/오답 보너스를 합산한다', async () => {
    solveLogFindMock.mockResolvedValue([
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

  it('스텝 시도를 생성한다', async () => {
    stepAttemptFindOneMock.mockResolvedValue({ attemptNo: 2 } as UserStepAttempt);
    quizCountMock.mockResolvedValue(5);
    stepAttemptSaveMock.mockResolvedValue({ id: 10 });

    const attempt = await service.startStepAttempt({
      userId: 100,
      stepId: 3,
    });

    expect(stepFindOneMock).toHaveBeenCalledWith({ where: { id: 3 } });
    expect(quizCountMock).toHaveBeenCalledWith({ where: { step: { id: 3 } } });
    expect(stepAttemptSaveMock).toHaveBeenCalled();
    expect(stepAttemptSaveMock.mock.calls[0][0]).toMatchObject({
      userId: 100,
      attemptNo: 3,
      totalQuizzes: 5,
      status: StepAttemptStatus.IN_PROGRESS,
    });
    expect(attempt).toEqual({ id: 10 });
  });

  it('스텝 시도를 완료하며 점수/성공률/소요 시간을 반환한다', async () => {
    const startedAt = new Date(Date.now() - 10_000);

    stepFindOneMock.mockResolvedValue({ id: 5 } as Step);
    stepAttemptFindOneMock.mockResolvedValue({
      id: 20,
      userId: 1,
      step: { id: 5 },
      attemptNo: 1,
      totalQuizzes: 4,
      startedAt,
      status: StepAttemptStatus.IN_PROGRESS,
    } as UserStepAttempt);
    solveLogFindMock.mockResolvedValue([
      { isCorrect: true } as SolveLog,
      { isCorrect: false } as SolveLog,
      { isCorrect: true } as SolveLog,
    ]);
    stepStatusFindOneMock.mockResolvedValue({
      userId: 1,
      step: { id: 5 },
      isCompleted: false,
      bestScore: 8,
    } as UserStepStatus);

    const result = await service.completeStepAttempt({
      userId: 1,
      stepId: 5,
    });

    expect(stepAttemptSaveMock).toHaveBeenCalled();
    const savedAttempt = stepAttemptSaveMock.mock.calls[0][0] as UserStepAttempt;
    expect(savedAttempt.status).toBe(StepAttemptStatus.COMPLETED);
    expect(savedAttempt.correctCount).toBe(2);
    expect(savedAttempt.answeredCount).toBe(3);
    expect(savedAttempt.successRate).toBe((2 / 4) * 100);

    expect(stepStatusSaveMock).toHaveBeenCalled();
    const expectedDuration = Math.floor((Date.now() - startedAt.getTime()) / 1000);
    expect(result).toEqual({
      score: 9,
      experience: 9,
      correctCount: 2,
      totalQuizzes: 4,
      answeredQuizzes: 3,
      successRate: (2 / 4) * 100,
      durationSeconds: result.durationSeconds,
      firstSolve: false,
    });
    expect(result.durationSeconds).toBeGreaterThanOrEqual(expectedDuration - 1);
    expect(result.durationSeconds).toBeLessThanOrEqual(expectedDuration + 2);
  });

  it('요청한 stepAttemptId가 있으면 해당 시도를 우선 완료한다', async () => {
    const startedAt = new Date(Date.now() - 5_000);

    stepFindOneMock.mockResolvedValue({ id: 7 } as Step);
    stepAttemptFindOneMock.mockImplementation(({ where }) => {
      if (where?.id === 30) {
        return Promise.resolve({
          id: 30,
          userId: 1,
          step: { id: 7 },
          attemptNo: 2,
          totalQuizzes: 2,
          startedAt,
          status: StepAttemptStatus.IN_PROGRESS,
        } as UserStepAttempt);
      }
      return Promise.resolve(null);
    });
    solveLogFindMock.mockResolvedValue([{ isCorrect: true } as SolveLog]);
    stepStatusFindOneMock.mockResolvedValue(null);

    const result = await service.completeStepAttempt({
      userId: 1,
      stepId: 7,
      stepAttemptId: 30,
    });

    expect(stepAttemptFindOneMock).toHaveBeenCalledWith({
      where: { id: 30, userId: 1, step: { id: 7 }, status: StepAttemptStatus.IN_PROGRESS },
    });
    expect(result).toMatchObject({
      score: 3,
      correctCount: 1,
      totalQuizzes: 2,
    });
    const savedAttempt = stepAttemptSaveMock.mock.calls[0][0] as UserStepAttempt;
    expect(savedAttempt.id).toBe(30);
  });

  it('비로그인 풀이 기록을 동기화하고 경험치를 증가시킨다', async () => {
    stepStatusFindOneMock.mockResolvedValue(null);
    stepFindOneMock.mockResolvedValue({ id: 1 } as Step);
    stepStatusSaveMock.mockResolvedValue({});

    const result = await service.syncStepStatuses(100, [1, 2, 3]);

    expect(result.syncedCount).toBe(3);
    expect(stepStatusSaveMock).toHaveBeenCalledTimes(3);
    expect(userIncrementMock).toHaveBeenCalledWith({ id: 100 }, 'experience', 90);
  });

  it('이미 존재하는 step은 건너뛴다', async () => {
    stepStatusFindOneMock
      .mockResolvedValueOnce({ userId: 100 } as UserStepStatus)
      .mockResolvedValueOnce(null);
    stepFindOneMock.mockResolvedValue({ id: 2 } as Step);
    stepStatusSaveMock.mockResolvedValue({});

    const result = await service.syncStepStatuses(100, [1, 2]);

    expect(result.syncedCount).toBe(1);
    expect(stepStatusSaveMock).toHaveBeenCalledTimes(1);
    expect(userIncrementMock).toHaveBeenCalledWith({ id: 100 }, 'experience', 30);
  });

  it('동기화할 step이 없으면 경험치를 증가시키지 않는다', async () => {
    stepStatusFindOneMock.mockResolvedValue({ userId: 100 } as UserStepStatus);

    const result = await service.syncStepStatuses(100, [1]);

    expect(result.syncedCount).toBe(0);
    expect(userIncrementMock).not.toHaveBeenCalled();
  });
});
