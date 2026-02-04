import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { RedisService } from '../common/redis/redis.service';
import { getKstNow, getKstWeekInfo } from '../common/utils/kst-date';
import { User } from '../users/entities/user.entity';

import type {
  MyTierResult,
  OverallRankingEntry,
  OverallRankingResult,
  RankingZone,
  WeeklyRankingEntry,
  WeeklyRankingResult,
} from './dto/ranking.dto';
import { RankingGroup } from './entities/ranking-group.entity';
import { RankingGroupMember } from './entities/ranking-group-member.entity';
import { RankingSnapshotStatus } from './entities/ranking-snapshot-status.enum';
import { RankingTier } from './entities/ranking-tier.entity';
import { RankingTierName } from './entities/ranking-tier.enum';
import { RankingTierRule } from './entities/ranking-tier-rule.entity';
import { RankingWeek } from './entities/ranking-week.entity';
import { RankingWeeklyXp } from './entities/ranking-weekly-xp.entity';
import { buildRankingSnapshots } from './ranking-evaluation.utils';

const RANKING_CACHE_TTL_SECONDS = 60;
const WEEKLY_RANKING_CACHE_PREFIX = 'ranking:weekly';
const OVERALL_RANKING_CACHE_PREFIX = 'ranking:overall';

@Injectable()
export class RankingQueryService {
  constructor(
    @InjectRepository(RankingWeek)
    private readonly weekRepository: Repository<RankingWeek>,
    @InjectRepository(RankingGroup)
    private readonly groupRepository: Repository<RankingGroup>,
    @InjectRepository(RankingGroupMember)
    private readonly memberRepository: Repository<RankingGroupMember>,
    @InjectRepository(RankingWeeklyXp)
    private readonly weeklyXpRepository: Repository<RankingWeeklyXp>,
    @InjectRepository(RankingTier)
    private readonly tierRepository: Repository<RankingTier>,
    @InjectRepository(RankingTierRule)
    private readonly tierRuleRepository: Repository<RankingTierRule>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
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
    const cached = await this.getCachedWeeklyRanking(userId, targetWeekKey);
    if (cached) {
      return cached;
    }

    const week = await this.weekRepository.findOne({ where: { weekKey: targetWeekKey } });

    if (!week) {
      const result: WeeklyRankingResult = {
        weekKey: targetWeekKey,
        tier: null,
        groupIndex: null,
        totalMembers: 0,
        myRank: null,
        myWeeklyXp: 0,
        members: [],
      };
      return this.cacheWeeklyRanking(userId, targetWeekKey, result);
    }

    const member = await this.memberRepository.findOne({
      where: { weekId: week.id, userId },
      relations: { tier: true, group: true },
    });

    if (!member || !member.group) {
      const fallbackTier = await this.findDefaultTier();
      const result: WeeklyRankingResult = {
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
      return this.cacheWeeklyRanking(userId, targetWeekKey, result);
    }

    const groupMembers = await this.memberRepository.find({
      where: { groupId: member.groupId },
      relations: { user: { profileCharacter: true } },
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
        profileImageUrl:
          groupMember.user?.profileCharacter?.imageUrl ?? groupMember.user?.profileImageUrl ?? null,
        xp: weeklyXp?.xp ?? 0,
        lastSolvedAt,
      };
    });

    const rankZoneMap = await this.buildRankZoneMap(member.tier?.id ?? null, rankingSeeds);
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
      rankZone: rankZoneMap.get(entry.userId) ?? 'MAINTAIN',
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

    const result: WeeklyRankingResult = {
      weekKey: targetWeekKey,
      tier,
      groupIndex: member.group.groupIndex,
      totalMembers: members.length,
      myRank,
      myWeeklyXp,
      members,
    };
    return this.cacheWeeklyRanking(userId, targetWeekKey, result);
  }

  /**
   * 주간 전체 랭킹을 조회한다.
   * - 티어 우선순위(높을수록 상위) → 주간 XP 순으로 정렬한다.
   *
   * @param userId 사용자 ID
   * @param weekKey 조회할 주차 키(없으면 현재 주차)
   * @returns {Promise<OverallRankingResult>} 주간 전체 랭킹 정보
   */
  async getOverallWeeklyRanking(
    userId: number,
    weekKey: string | null,
  ): Promise<OverallRankingResult> {
    const targetWeekKey = weekKey ?? getKstWeekInfo(getKstNow()).weekKey;
    const cached = await this.getCachedOverallWeeklyRanking(userId, targetWeekKey);
    if (cached) {
      return cached;
    }

    const week = await this.weekRepository.findOne({ where: { weekKey: targetWeekKey } });

    if (!week) {
      const result: OverallRankingResult = {
        weekKey: targetWeekKey,
        totalMembers: 0,
        myRank: null,
        myWeeklyXp: 0,
        members: [],
      };
      return this.cacheOverallWeeklyRanking(userId, targetWeekKey, result);
    }

    const allMembers = await this.memberRepository.find({
      where: { weekId: week.id },
      relations: { user: { profileCharacter: true }, tier: true },
    });

    if (allMembers.length === 0) {
      const result: OverallRankingResult = {
        weekKey: targetWeekKey,
        totalMembers: 0,
        myRank: null,
        myWeeklyXp: 0,
        members: [],
      };
      return this.cacheOverallWeeklyRanking(userId, targetWeekKey, result);
    }

    const memberIds = allMembers.map(member => member.userId);
    const weeklyXpList = await this.weeklyXpRepository.find({
      where: { weekId: week.id, userId: In(memberIds) },
    });
    const weeklyXpMap = new Map(weeklyXpList.map(item => [item.userId, item]));

    const rankingSeeds = allMembers.map(member => {
      const weeklyXp = weeklyXpMap.get(member.userId);
      const lastSolvedAt = weeklyXp?.lastSolvedAt ?? weeklyXp?.firstSolvedAt ?? member.joinedAt;

      return {
        userId: member.userId,
        displayName: member.user?.displayName ?? '알 수 없음',
        profileImageUrl:
          member.user?.profileCharacter?.imageUrl ?? member.user?.profileImageUrl ?? null,
        xp: weeklyXp?.xp ?? 0,
        lastSolvedAt,
        tierName: member.tier?.name ?? null,
        tierOrderIndex: member.tier?.orderIndex ?? null,
      };
    });

    const sorted = [...rankingSeeds].sort((left, right) => {
      const leftTierOrderIndex = left.tierOrderIndex ?? 0;
      const rightTierOrderIndex = right.tierOrderIndex ?? 0;

      if (leftTierOrderIndex !== rightTierOrderIndex) {
        return rightTierOrderIndex - leftTierOrderIndex;
      }

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

    const members: OverallRankingEntry[] = sorted.map((entry, index) => ({
      userId: entry.userId,
      displayName: entry.displayName,
      profileImageUrl: entry.profileImageUrl,
      xp: entry.xp,
      rank: index + 1,
      isMe: entry.userId === userId,
      rankZone: 'MAINTAIN',
      tierName: entry.tierName,
      tierOrderIndex: entry.tierOrderIndex,
    }));

    const myRank = members.find(entry => entry.userId === userId)?.rank ?? null;
    const myWeeklyXp = weeklyXpMap.get(userId)?.xp ?? 0;

    const result: OverallRankingResult = {
      weekKey: targetWeekKey,
      totalMembers: members.length,
      myRank,
      myWeeklyXp,
      members,
    };
    return this.cacheOverallWeeklyRanking(userId, targetWeekKey, result);
  }

  /**
   * 관리자용으로 특정 티어/그룹 기준 주간 랭킹을 조회한다.
   *
   * @param tierId 조회할 티어 ID
   * @param groupIndex 조회할 그룹 번호
   * @param weekKey 조회할 주차 키(없으면 현재 주차)
   * @returns {Promise<WeeklyRankingResult>} 주간 랭킹 정보
   */
  async getWeeklyRankingByGroup(
    tierId: number,
    groupIndex: number,
    weekKey: string | null,
  ): Promise<WeeklyRankingResult> {
    const targetWeekKey = weekKey ?? getKstWeekInfo(getKstNow()).weekKey;
    const tier = await this.tierRepository.findOne({ where: { id: tierId } });

    if (!tier) {
      throw new NotFoundException('티어 정보를 찾을 수 없습니다.');
    }

    const tierSummary = {
      id: tier.id,
      name: tier.name,
      orderIndex: tier.orderIndex,
    };

    const week = await this.weekRepository.findOne({ where: { weekKey: targetWeekKey } });
    if (!week) {
      return {
        weekKey: targetWeekKey,
        tier: tierSummary,
        groupIndex,
        totalMembers: 0,
        myRank: null,
        myWeeklyXp: 0,
        members: [],
      };
    }

    const group = await this.groupRepository.findOne({
      where: { weekId: week.id, tierId, groupIndex },
    });
    if (!group) {
      return {
        weekKey: targetWeekKey,
        tier: tierSummary,
        groupIndex,
        totalMembers: 0,
        myRank: null,
        myWeeklyXp: 0,
        members: [],
      };
    }

    const groupMembers = await this.memberRepository.find({
      where: { groupId: group.id },
      relations: { user: { profileCharacter: true } },
    });

    if (groupMembers.length === 0) {
      return {
        weekKey: targetWeekKey,
        tier: tierSummary,
        groupIndex,
        totalMembers: 0,
        myRank: null,
        myWeeklyXp: 0,
        members: [],
      };
    }

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
        profileImageUrl:
          groupMember.user?.profileCharacter?.imageUrl ?? groupMember.user?.profileImageUrl ?? null,
        xp: weeklyXp?.xp ?? 0,
        lastSolvedAt,
      };
    });

    const rankZoneMap = await this.buildRankZoneMap(tierId, rankingSeeds);
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
      isMe: false,
      rankZone: rankZoneMap.get(entry.userId) ?? 'MAINTAIN',
    }));

    return {
      weekKey: targetWeekKey,
      tier: tierSummary,
      groupIndex,
      totalMembers: members.length,
      myRank: null,
      myWeeklyXp: 0,
      members,
    };
  }

  /**
   * 관리자용으로 특정 티어명/그룹 기준 주간 랭킹을 조회한다.
   *
   * @param tierName 조회할 티어명
   * @param groupIndex 조회할 그룹 번호
   * @param weekKey 조회할 주차 키(없으면 현재 주차)
   * @returns {Promise<WeeklyRankingResult>} 주간 랭킹 정보
   */
  async getWeeklyRankingByTierName(
    tierName: RankingTierName,
    groupIndex: number,
    weekKey: string | null,
  ): Promise<WeeklyRankingResult> {
    const tier = await this.tierRepository.findOne({ where: { name: tierName } });

    if (!tier) {
      throw new NotFoundException('티어 정보를 찾을 수 없습니다.');
    }

    return this.getWeeklyRankingByGroup(tier.id, groupIndex, weekKey);
  }

  private async findDefaultTier(): Promise<RankingTier | null> {
    return this.tierRepository.findOne({ where: { name: RankingTierName.BRONZE } });
  }

  /**
   * 랭킹 결과에 승급/유지/강등 구역을 매핑한다.
   *
   * @param tierId 티어 ID
   * @param members 랭킹 계산 대상 목록
   * @returns 사용자별 구역 매핑
   */
  private async buildRankZoneMap(
    tierId: number | null,
    members: Array<{ userId: number; xp: number; lastSolvedAt: Date }>,
  ): Promise<Map<number, RankingZone>> {
    if (!tierId || members.length === 0) {
      return new Map();
    }

    const rule = await this.tierRuleRepository.findOne({ where: { tierId } });
    if (!rule) {
      return new Map();
    }

    const snapshots = buildRankingSnapshots({ members, rule });
    const zoneMap = new Map<number, RankingZone>();

    snapshots.forEach(snapshot => {
      zoneMap.set(snapshot.userId, this.mapSnapshotStatusToZone(snapshot.status));
    });

    return zoneMap;
  }

  /**
   * 스냅샷 상태를 랭킹 구역으로 변환한다.
   *
   * @param status 스냅샷 상태
   * @returns 랭킹 구역
   */
  private mapSnapshotStatusToZone(status: RankingSnapshotStatus): RankingZone {
    if (status === RankingSnapshotStatus.PROMOTED) {
      return 'PROMOTION';
    }

    if (status === RankingSnapshotStatus.DEMOTED) {
      return 'DEMOTION';
    }

    return 'MAINTAIN';
  }

  private async cacheWeeklyRanking(
    userId: number,
    weekKey: string,
    result: WeeklyRankingResult,
  ): Promise<WeeklyRankingResult> {
    await this.setCachedWeeklyRanking(userId, weekKey, result);
    return result;
  }

  private async cacheOverallWeeklyRanking(
    userId: number,
    weekKey: string,
    result: OverallRankingResult,
  ): Promise<OverallRankingResult> {
    await this.setCachedOverallWeeklyRanking(userId, weekKey, result);
    return result;
  }

  private buildWeeklyRankingCacheKey(userId: number, weekKey: string): string {
    return `${WEEKLY_RANKING_CACHE_PREFIX}:${weekKey}:${userId}`;
  }

  private buildOverallWeeklyRankingCacheKey(userId: number, weekKey: string): string {
    return `${OVERALL_RANKING_CACHE_PREFIX}:${weekKey}:${userId}`;
  }

  private async getCachedWeeklyRanking(
    userId: number,
    weekKey: string,
  ): Promise<WeeklyRankingResult | null> {
    const cacheKey = this.buildWeeklyRankingCacheKey(userId, weekKey);

    try {
      const cached = await this.redisService.get(cacheKey);
      if (!this.isWeeklyRankingResult(cached)) {
        return null;
      }
      return cached;
    } catch {
      return null;
    }
  }

  private async setCachedWeeklyRanking(
    userId: number,
    weekKey: string,
    result: WeeklyRankingResult,
  ): Promise<void> {
    const cacheKey = this.buildWeeklyRankingCacheKey(userId, weekKey);

    try {
      await this.redisService.set(cacheKey, result, RANKING_CACHE_TTL_SECONDS);
    } catch {
      return;
    }
  }

  private async getCachedOverallWeeklyRanking(
    userId: number,
    weekKey: string,
  ): Promise<OverallRankingResult | null> {
    const cacheKey = this.buildOverallWeeklyRankingCacheKey(userId, weekKey);

    try {
      const cached = await this.redisService.get(cacheKey);
      if (!this.isOverallRankingResult(cached)) {
        return null;
      }
      return cached;
    } catch {
      return null;
    }
  }

  private async setCachedOverallWeeklyRanking(
    userId: number,
    weekKey: string,
    result: OverallRankingResult,
  ): Promise<void> {
    const cacheKey = this.buildOverallWeeklyRankingCacheKey(userId, weekKey);

    try {
      await this.redisService.set(cacheKey, result, RANKING_CACHE_TTL_SECONDS);
    } catch {
      return;
    }
  }

  private isWeeklyRankingResult(value: unknown): value is WeeklyRankingResult {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const record = value as { members?: unknown };
    return Array.isArray(record.members);
  }

  private isOverallRankingResult(value: unknown): value is OverallRankingResult {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const record = value as { members?: unknown };
    return Array.isArray(record.members);
  }
}
