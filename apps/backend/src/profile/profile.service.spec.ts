import { BadRequestException } from '@nestjs/common';
import type { Repository } from 'typeorm';

import { SolveLog } from '../progress/entities/solve-log.entity';
import { StepAttemptStatus, UserStepAttempt } from '../progress/entities/user-step-attempt.entity';
import { User } from '../users/entities/user.entity';

import { UserFollow } from './entities/user-follow.entity';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let service: ProfileService;
  let userRepository: Partial<Repository<User>>;
  let solveLogRepository: Partial<Repository<SolveLog>>;
  let stepAttemptRepository: Partial<Repository<UserStepAttempt>>;
  let followRepository: Partial<Repository<UserFollow>>;
  let userFindOneMock: jest.Mock;
  let followCountMock: jest.Mock;
  let followFindOneMock: jest.Mock;
  let followSaveMock: jest.Mock;
  let followCreateMock: jest.Mock;
  let followFindMock: jest.Mock;
  let solveLogQueryBuilderMock: {
    select: jest.Mock;
    addSelect: jest.Mock;
    where: jest.Mock;
    getRawOne: jest.Mock;
  };
  let stepAttemptQueryBuilderMock: {
    select: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    getRawOne: jest.Mock;
  };

  beforeEach(() => {
    userFindOneMock = jest.fn();
    followCountMock = jest.fn();
    followFindOneMock = jest.fn();
    followSaveMock = jest.fn();
    followCreateMock = jest.fn(entity => entity);
    followFindMock = jest.fn();

    solveLogQueryBuilderMock = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
    };
    stepAttemptQueryBuilderMock = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
    };

    userRepository = {
      findOne: userFindOneMock,
    };

    solveLogRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(solveLogQueryBuilderMock),
    };
    stepAttemptRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(stepAttemptQueryBuilderMock),
    };

    followRepository = {
      count: followCountMock,
      findOne: followFindOneMock,
      save: followSaveMock,
      create: followCreateMock,
      find: followFindMock,
    };

    service = new ProfileService(
      userRepository as Repository<User>,
      solveLogRepository as Repository<SolveLog>,
      stepAttemptRepository as Repository<UserStepAttempt>,
      followRepository as Repository<UserFollow>,
    );
  });

  it('프로필 요약에 통계와 팔로우 수를 포함한다', async () => {
    userFindOneMock.mockResolvedValue({
      id: 1,
      displayName: '펀다',
      profileImageUrl: null,
      experience: 120,
      currentStreak: 7,
      currentTier: { id: 2, name: 'BRONZE', orderIndex: 1 },
    } as User);

    followCountMock.mockImplementation(async options => {
      if (options?.where?.followingId === 1) {
        return 3;
      }

      if (options?.where?.followerId === 1) {
        return 5;
      }

      return 0;
    });

    solveLogQueryBuilderMock.getRawOne.mockResolvedValue({
      solvedCount: '12',
    });
    stepAttemptQueryBuilderMock.getRawOne.mockResolvedValue({
      totalDurationSeconds: '3600',
    });

    const result = await service.getProfileSummary(1);

    expect(result.followerCount).toBe(3);
    expect(result.followingCount).toBe(5);
    expect(result.totalStudyTimeSeconds).toBe(3600);
    expect(result.totalStudyTimeMinutes).toBe(60);
    expect(result.solvedQuestionCount).toBe(12);
    expect(result.tier?.name).toBe('BRONZE');
    expect(stepAttemptQueryBuilderMock.andWhere).toHaveBeenCalledWith(
      'stepAttempt.status = :status',
      { status: StepAttemptStatus.COMPLETED },
    );
  });

  it('팔로우 요청 시 관계를 저장한다', async () => {
    userFindOneMock.mockResolvedValue({ id: 2 } as User);
    followFindOneMock.mockResolvedValue(null);

    const result = await service.followUser(2, 1);

    expect(result.isFollowing).toBe(true);
    expect(followCreateMock).toHaveBeenCalledWith({ followerId: 1, followingId: 2 });
    expect(followSaveMock).toHaveBeenCalled();
  });

  it('자기 자신을 팔로우하려 하면 실패한다', async () => {
    await expect(service.followUser(1, 1)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('팔로워 목록을 사용자 요약으로 반환한다', async () => {
    userFindOneMock.mockResolvedValue({ id: 1 } as User);
    followFindMock.mockResolvedValue([
      {
        follower: {
          id: 10,
          displayName: '리더',
          profileImageUrl: 'https://example.com/avatar.png',
          experience: 200,
          currentTier: { id: 1, name: 'BRONZE', orderIndex: 1 },
        },
      } as UserFollow,
    ]);

    const result = await service.getFollowers(1);

    expect(result).toHaveLength(1);
    const [firstFollower] = result;
    if (!firstFollower) {
      throw new Error('팔로워 목록이 비어 있습니다.');
    }
    expect(firstFollower.userId).toBe(10);
    expect(firstFollower.tier?.name).toBe('BRONZE');
  });
});
