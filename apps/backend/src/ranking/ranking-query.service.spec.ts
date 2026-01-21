import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';

import { RankingGroup } from './entities/ranking-group.entity';
import { RankingGroupMember } from './entities/ranking-group-member.entity';
import { RankingTier } from './entities/ranking-tier.entity';
import { RankingTierName } from './entities/ranking-tier.enum';
import { RankingWeek } from './entities/ranking-week.entity';
import { RankingWeeklyXp } from './entities/ranking-weekly-xp.entity';
import { RankingQueryService } from './ranking-query.service';

describe('RankingQueryService', () => {
  let service: RankingQueryService;
  let weekRepository: Partial<Repository<RankingWeek>>;
  let memberRepository: Partial<Repository<RankingGroupMember>>;
  let weeklyXpRepository: Partial<Repository<RankingWeeklyXp>>;
  let tierRepository: Partial<Repository<RankingTier>>;
  let userRepository: Partial<Repository<User>>;

  beforeEach(() => {
    weekRepository = { findOne: jest.fn() };
    memberRepository = { findOne: jest.fn(), find: jest.fn() };
    weeklyXpRepository = { find: jest.fn() };
    tierRepository = { findOne: jest.fn() };
    userRepository = { findOne: jest.fn() };

    service = new RankingQueryService(
      weekRepository as Repository<RankingWeek>,
      memberRepository as Repository<RankingGroupMember>,
      weeklyXpRepository as Repository<RankingWeeklyXp>,
      tierRepository as Repository<RankingTier>,
      userRepository as Repository<User>,
    );
  });

  it('내 티어를 반환한다', async () => {
    const tier = { id: 10, name: RankingTierName.SILVER, orderIndex: 2 } as RankingTier;
    const user = { id: 1, currentTier: tier, diamondCount: 15 } as User;

    (userRepository.findOne as jest.Mock).mockResolvedValue(user);

    const result = await service.getMyTier(1);

    expect(result.tier?.id).toBe(10);
    expect(result.diamondCount).toBe(15);
  });

  it('사용자가 없으면 예외를 발생시킨다', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(service.getMyTier(999)).rejects.toThrow(NotFoundException);
  });

  it('주간 랭킹을 그룹 기준으로 정렬해서 반환한다', async () => {
    const week = { id: 1, weekKey: '2025-01' } as RankingWeek;
    const tier = { id: 3, name: RankingTierName.GOLD, orderIndex: 3 } as RankingTier;
    const group = { id: 7, groupIndex: 1 } as RankingGroup;
    const member = { weekId: 1, userId: 1, tier, group, groupId: 7 } as RankingGroupMember;
    const members = [
      { userId: 1, joinedAt: new Date('2025-01-02'), user: { displayName: 'A' } },
      { userId: 2, joinedAt: new Date('2025-01-01'), user: { displayName: 'B' } },
    ] as RankingGroupMember[];
    const weeklyXpList = [
      { userId: 1, xp: 9, lastSolvedAt: new Date('2025-01-02') },
      { userId: 2, xp: 6, lastSolvedAt: new Date('2025-01-01') },
    ] as RankingWeeklyXp[];

    (weekRepository.findOne as jest.Mock).mockResolvedValue(week);
    (memberRepository.findOne as jest.Mock).mockResolvedValue(member);
    (memberRepository.find as jest.Mock).mockResolvedValue(members);
    (weeklyXpRepository.find as jest.Mock).mockResolvedValue(weeklyXpList);

    const result = await service.getWeeklyRanking(1, '2025-01');

    expect(result.members[0]?.userId).toBe(1);
    expect(result.members[0]?.rank).toBe(1);
    expect(result.myRank).toBe(1);
    expect(result.tier?.id).toBe(3);
  });
});
