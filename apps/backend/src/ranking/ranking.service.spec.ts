import { NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { getKstNow } from '../common/utils/kst-date';
import { User } from '../users/entities/user.entity';

import { RankingGroup } from './entities/ranking-group.entity';
import { RankingGroupMember } from './entities/ranking-group-member.entity';
import { RankingTier } from './entities/ranking-tier.entity';
import { RankingTierName } from './entities/ranking-tier.enum';
import { RankingWeek } from './entities/ranking-week.entity';
import { RankingWeeklyXp } from './entities/ranking-weekly-xp.entity';
import { RankingService } from './ranking.service';

describe('RankingService', () => {
  let service: RankingService;
  let dataSource: Partial<DataSource>;
  let manager: EntityManager;
  let weekRepository: Partial<Repository<RankingWeek>>;
  let tierRepository: Partial<Repository<RankingTier>>;
  let groupRepository: Partial<Repository<RankingGroup>>;
  let memberRepository: Partial<Repository<RankingGroupMember>>;
  let weeklyXpRepository: Partial<Repository<RankingWeeklyXp>>;
  let userRepository: Partial<Repository<User>>;
  let weeklyXpQueryBuilder: {
    setLock: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    getOne: jest.Mock;
  };

  beforeEach(() => {
    weekRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    tierRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    groupRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    memberRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };
    weeklyXpQueryBuilder = {
      setLock: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };
    weeklyXpRepository = {
      createQueryBuilder: jest.fn(() => weeklyXpQueryBuilder),
      create: jest.fn(),
      save: jest.fn(),
    };
    userRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const getRepository = jest.fn(entity => {
      if (entity === RankingWeek) {
        return weekRepository as Repository<RankingWeek>;
      }
      if (entity === RankingTier) {
        return tierRepository as Repository<RankingTier>;
      }
      if (entity === RankingGroup) {
        return groupRepository as Repository<RankingGroup>;
      }
      if (entity === RankingGroupMember) {
        return memberRepository as Repository<RankingGroupMember>;
      }
      if (entity === RankingWeeklyXp) {
        return weeklyXpRepository as Repository<RankingWeeklyXp>;
      }
      if (entity === User) {
        return userRepository as Repository<User>;
      }
      throw new Error('알 수 없는 Repository 요청');
    });

    manager = { getRepository } as unknown as EntityManager;

    dataSource = {
      transaction: jest.fn(async (...args: unknown[]) => {
        const callback = typeof args[0] === 'function' ? args[0] : args[1];
        if (typeof callback !== 'function') {
          throw new Error('transaction 콜백이 없습니다.');
        }
        return callback(manager as EntityManager);
      }),
    };

    service = new RankingService(dataSource as DataSource);
  });

  it('주차 첫 풀이 시 기본 티어로 그룹을 만든다', async () => {
    const solvedAt = getKstNow();
    const user = { id: 1, currentTierId: null } as User;
    const tier = { id: 10, name: RankingTierName.BRONZE, maxGroupSize: 10 } as RankingTier;
    const week = { id: 2, weekKey: '2025-01' } as RankingWeek;
    const group = { id: 3, groupIndex: 1, capacity: 10 } as RankingGroup;

    (weekRepository.findOne as jest.Mock).mockResolvedValue(null);
    (weekRepository.create as jest.Mock).mockReturnValue(week);
    (weekRepository.save as jest.Mock).mockResolvedValue(week);
    (memberRepository.findOne as jest.Mock).mockResolvedValue(null);
    (userRepository.findOne as jest.Mock).mockResolvedValue(user);
    (tierRepository.findOne as jest.Mock).mockResolvedValue(tier);
    (userRepository.save as jest.Mock).mockResolvedValue(user);
    (groupRepository.findOne as jest.Mock).mockResolvedValue(null);
    (groupRepository.create as jest.Mock).mockReturnValue(group);
    (groupRepository.save as jest.Mock).mockResolvedValue(group);
    (memberRepository.create as jest.Mock).mockReturnValue({
      weekId: week.id,
      tierId: tier.id,
      groupId: group.id,
      userId: user.id,
      joinedAt: solvedAt,
    });

    await service.assignUserToGroupOnFirstSolveWithManager(manager as EntityManager, {
      userId: 1,
      solvedAt,
    });

    expect(memberRepository.save).toHaveBeenCalled();
    expect(userRepository.save).toHaveBeenCalledWith(user);
  });

  it('마지막 그룹이 꽉 찼으면 새 그룹을 만든다', async () => {
    const solvedAt = getKstNow();
    const user = { id: 1, currentTierId: 10 } as User;
    const tier = { id: 10, name: RankingTierName.BRONZE, maxGroupSize: 2 } as RankingTier;
    const week = { id: 2, weekKey: '2025-01' } as RankingWeek;
    const lastGroup = { id: 3, groupIndex: 1, capacity: 2 } as RankingGroup;
    const nextGroup = { id: 4, groupIndex: 2, capacity: 2 } as RankingGroup;

    (weekRepository.findOne as jest.Mock).mockResolvedValue(week);
    (memberRepository.findOne as jest.Mock).mockResolvedValue(null);
    (userRepository.findOne as jest.Mock).mockResolvedValue(user);
    (tierRepository.findOne as jest.Mock).mockResolvedValue(tier);
    (groupRepository.findOne as jest.Mock).mockResolvedValue(lastGroup);
    (memberRepository.count as jest.Mock).mockResolvedValue(2);
    (groupRepository.create as jest.Mock).mockReturnValue(nextGroup);
    (groupRepository.save as jest.Mock).mockResolvedValue(nextGroup);
    (memberRepository.create as jest.Mock).mockReturnValue({
      weekId: week.id,
      tierId: tier.id,
      groupId: nextGroup.id,
      userId: user.id,
      joinedAt: solvedAt,
    });

    await service.assignUserToGroupOnFirstSolveWithManager(manager as EntityManager, {
      userId: 1,
      solvedAt,
    });

    expect(groupRepository.create).toHaveBeenCalledWith({
      weekId: week.id,
      tierId: tier.id,
      groupIndex: 2,
      capacity: tier.maxGroupSize,
    });
    expect(memberRepository.save).toHaveBeenCalled();
  });

  it('사용자가 없으면 예외를 발생시킨다', async () => {
    const solvedAt = getKstNow();

    (weekRepository.findOne as jest.Mock).mockResolvedValue({
      id: 1,
      weekKey: '2025-01',
    });
    (memberRepository.findOne as jest.Mock).mockResolvedValue(null);
    (userRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      service.assignUserToGroupOnFirstSolveWithManager(manager as EntityManager, {
        userId: 999,
        solvedAt,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('주간 XP가 없으면 새로 생성한다', async () => {
    const solvedAt = getKstNow();
    const user = { id: 1, currentTierId: 10 } as User;
    const tier = { id: 10, name: RankingTierName.BRONZE, maxGroupSize: 10 } as RankingTier;
    const week = { id: 2, weekKey: '2025-01' } as RankingWeek;
    const weeklyXp = {
      weekId: week.id,
      userId: user.id,
      tierId: tier.id,
      xp: 3,
      solvedCount: 1,
      firstSolvedAt: solvedAt,
      lastSolvedAt: solvedAt,
    } as RankingWeeklyXp;

    (weekRepository.findOne as jest.Mock).mockResolvedValue(week);
    weeklyXpQueryBuilder.getOne.mockResolvedValue(null);
    (userRepository.findOne as jest.Mock).mockResolvedValue(user);
    (tierRepository.findOne as jest.Mock).mockResolvedValue(tier);
    (weeklyXpRepository.create as jest.Mock).mockReturnValue(weeklyXp);

    await service.addWeeklyXpOnSolveWithManager(manager as EntityManager, {
      userId: user.id,
      solvedAt,
      isCorrect: true,
    });

    expect(weeklyXpRepository.save).toHaveBeenCalledWith(weeklyXp);
  });

  it('주간 XP가 있으면 누적 업데이트한다', async () => {
    const solvedAt = getKstNow();
    const user = { id: 1, currentTierId: 10 } as User;
    const tier = { id: 10, name: RankingTierName.BRONZE, maxGroupSize: 10 } as RankingTier;
    const week = { id: 2, weekKey: '2025-01' } as RankingWeek;
    const existingWeeklyXp = {
      weekId: week.id,
      userId: user.id,
      tierId: tier.id,
      xp: 6,
      solvedCount: 2,
      firstSolvedAt: solvedAt,
      lastSolvedAt: solvedAt,
    } as RankingWeeklyXp;

    (weekRepository.findOne as jest.Mock).mockResolvedValue(week);
    weeklyXpQueryBuilder.getOne.mockResolvedValue(existingWeeklyXp);
    (userRepository.findOne as jest.Mock).mockResolvedValue(user);
    (tierRepository.findOne as jest.Mock).mockResolvedValue(tier);

    await service.addWeeklyXpOnSolveWithManager(manager as EntityManager, {
      userId: user.id,
      solvedAt,
      isCorrect: false,
    });

    expect(existingWeeklyXp.xp).toBe(9);
    expect(existingWeeklyXp.solvedCount).toBe(3);
    expect(existingWeeklyXp.lastSolvedAt).toBe(solvedAt);
    expect(weeklyXpRepository.save).toHaveBeenCalledWith(existingWeeklyXp);
  });
});
