import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { getKstNow, getKstWeekInfo } from '../common/utils/kst-date';
import { User } from '../users/entities/user.entity';

import type { MyTierResult, WeeklyRankingEntry, WeeklyRankingResult } from './dto/ranking.dto';
import { RankingGroupMember } from './entities/ranking-group-member.entity';
import { RankingTier } from './entities/ranking-tier.entity';
import { RankingTierName } from './entities/ranking-tier.enum';
import { RankingWeek } from './entities/ranking-week.entity';
import { RankingWeeklyXp } from './entities/ranking-weekly-xp.entity';

@Injectable()
export class RankingQueryService {
  constructor(
    @InjectRepository(RankingWeek)
    private readonly weekRepository: Repository<RankingWeek>,
    @InjectRepository(RankingGroupMember)
    private readonly memberRepository: Repository<RankingGroupMember>,
    @InjectRepository(RankingWeeklyXp)
    private readonly weeklyXpRepository: Repository<RankingWeeklyXp>,
    @InjectRepository(RankingTier)
    private readonly tierRepository: Repository<RankingTier>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 현재 사용자 기준으로 티어 정보를 반환한다.
   *
   * @param userId 사용자 ID
   * @returns {Promise<MyTierResult>} 내 티어 정보
   */
  async getMyTier(userId: number): Promise<MyTierResult> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { currentTier: true },
    });
    if (!user) {
      throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
    }

    const fallbackTier = await this.findDefaultTier();
    const tier = user.currentTier ?? fallbackTier;

    return {
      tier: tier
        ? {
            id: tier.id,
            name: tier.name,
            orderIndex: tier.orderIndex,
          }
        : null,
      diamondCount: user.diamondCount,
    };
  }

  /**
   * 주간 랭킹을 그룹 기준으로 조회한다.
   *
   * @param userId 사용자 ID
   * @param weekKey 조회할 주차 키(없으면 현재 주차)
   * @returns {Promise<WeeklyRankingResult>} 주간 랭킹 정보
   */
  async getWeeklyRanking(userId: number, weekKey: string | null): Promise<WeeklyRankingResult> {
    const targetWeekKey = weekKey ?? getKstWeekInfo(getKstNow()).weekKey;
    const week = await this.weekRepository.findOne({ where: { weekKey: targetWeekKey } });

    if (!week) {
      return {
        weekKey: targetWeekKey,
        tier: null,
        groupIndex: null,
        totalMembers: 0,
        myRank: null,
        myWeeklyXp: 0,
        members: [],
      };
    }

    const member = await this.memberRepository.findOne({
      where: { weekId: week.id, userId },
      relations: { tier: true, group: true },
    });

    if (!member || !member.group) {
      const fallbackTier = await this.findDefaultTier();
      return {
        weekKey: targetWeekKey,
        tier: fallbackTier
          ? {
              id: fallbackTier.id,
              name: fallbackTier.name,
              orderIndex: fallbackTier.orderIndex,
            }
          : null,
        groupIndex: null,
        totalMembers: 0,
        myRank: null,
        myWeeklyXp: 0,
        members: [],
      };
    }

    const groupMembers = await this.memberRepository.find({
      where: { groupId: member.groupId },
      relations: { user: true },
    });
    const memberIds = groupMembers.map(groupMember => groupMember.userId);
    const weeklyXpList = await this.weeklyXpRepository.find({
      where: { weekId: week.id, userId: In(memberIds) },
    });
    const weeklyXpMap = new Map(weeklyXpList.map(item => [item.userId, item]));

    const rankingSeeds = groupMembers.map(groupMember => {
      const weeklyXp = weeklyXpMap.get(groupMember.userId);
      const lastSolvedAt =
        weeklyXp?.lastSolvedAt ?? weeklyXp?.firstSolvedAt ?? groupMember.joinedAt;

      return {
        userId: groupMember.userId,
        displayName: groupMember.user?.displayName ?? '알 수 없음',
        profileImageUrl: groupMember.user?.profileImageUrl ?? null,
        xp: weeklyXp?.xp ?? 0,
        lastSolvedAt,
      };
    });

    const sorted = [...rankingSeeds].sort((left, right) => {
      if (left.xp !== right.xp) {
        return right.xp - left.xp;
      }
      const leftTime = left.lastSolvedAt.getTime();
      const rightTime = right.lastSolvedAt.getTime();
      if (leftTime !== rightTime) {
        return leftTime - rightTime;
      }
      return left.userId - right.userId;
    });

    const members: WeeklyRankingEntry[] = sorted.map((entry, index) => ({
      userId: entry.userId,
      displayName: entry.displayName,
      profileImageUrl: entry.profileImageUrl,
      xp: entry.xp,
      rank: index + 1,
      isMe: entry.userId === userId,
    }));

    const myRank = members.find(entry => entry.userId === userId)?.rank ?? null;
    const myWeeklyXp = weeklyXpMap.get(userId)?.xp ?? 0;
    const tier = member.tier
      ? {
          id: member.tier.id,
          name: member.tier.name,
          orderIndex: member.tier.orderIndex,
        }
      : null;

    return {
      weekKey: targetWeekKey,
      tier,
      groupIndex: member.group.groupIndex,
      totalMembers: members.length,
      myRank,
      myWeeklyXp,
      members,
    };
  }

  private async findDefaultTier(): Promise<RankingTier | null> {
    return this.tierRepository.findOne({ where: { name: RankingTierName.BRONZE } });
  }
}
