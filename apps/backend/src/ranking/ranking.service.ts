import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { getKstWeekInfo } from '../common/utils/kst-date';
import { calculateScorePerSolve } from '../common/utils/score-weights';
import { User } from '../users/entities/user.entity';

import { RankingGroup } from './entities/ranking-group.entity';
import { RankingGroupMember } from './entities/ranking-group-member.entity';
import { RankingTier } from './entities/ranking-tier.entity';
import { RankingTierName } from './entities/ranking-tier.enum';
import { RankingWeek } from './entities/ranking-week.entity';
import { RankingWeekStatus } from './entities/ranking-week-status.enum';
import { RankingWeeklyXp } from './entities/ranking-weekly-xp.entity';

interface AssignGroupParams {
  userId: number;
  solvedAt: Date;
}

interface AddWeeklyXpParams {
  userId: number;
  solvedAt: Date;
  isCorrect: boolean;
}

@Injectable()
export class RankingService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /**
   * 주차 첫 풀이 시점에 경쟁 그룹을 배정한다.
   * - 한 주차에는 한 번만 배정된다.
   * - 티어별로 최대 인원까지 그룹을 채운 후 다음 그룹을 만든다.
   *
   * @param params.userId 사용자 ID
   * @param params.solvedAt 풀이 시각(KST 기준)
   * @returns {Promise<void>} 작업 완료
   */
  async assignUserToGroupOnFirstSolve(params: AssignGroupParams): Promise<void> {
    await this.dataSource.transaction(async manager => {
      await this.assignUserToGroupOnFirstSolveWithManager(manager, params);
    });
  }

  /**
   * 트랜잭션 내부에서 그룹 배정을 처리한다.
   *
   * @param manager 트랜잭션 매니저
   * @param params.userId 사용자 ID
   * @param params.solvedAt 풀이 시각(KST 기준)
   * @returns {Promise<void>} 작업 완료
   */
  async assignUserToGroupOnFirstSolveWithManager(
    manager: EntityManager,
    params: AssignGroupParams,
  ): Promise<void> {
    const { userId, solvedAt } = params;
    const weekInfo = getKstWeekInfo(solvedAt);

    const weekRepository = manager.getRepository(RankingWeek);
    const memberRepository = manager.getRepository(RankingGroupMember);

    const week = await this.findOrCreateWeek(weekRepository, weekInfo);
    const existingMember = await memberRepository.findOne({
      where: { weekId: week.id, userId },
    });

    if (existingMember) {
      return;
    }

    const user = await this.findUserOrThrow(manager, userId);
    const tier = await this.findOrAssignTier(manager, user);

    const group = await this.findOrCreateTargetGroup(manager, week, tier);
    const member = memberRepository.create({
      weekId: week.id,
      tierId: tier.id,
      groupId: group.id,
      userId,
      joinedAt: solvedAt,
    });

    await memberRepository.save(member);
  }

  /**
   * 풀이 기록에 맞춰 주간 XP를 적립한다.
   * - 같은 주차에 이미 데이터가 있으면 누적 업데이트한다.
   * - 주간 XP는 주차/유저 단위로만 관리한다.
   *
   * @param manager 트랜잭션 매니저
   * @param params.userId 사용자 ID
   * @param params.solvedAt 풀이 시각(KST 기준)
   * @param params.gainedXp 적립 XP
   * @returns {Promise<void>} 작업 완료
   */
  async addWeeklyXpOnSolveWithManager(
    manager: EntityManager,
    params: AddWeeklyXpParams,
  ): Promise<void> {
    const { userId, solvedAt, isCorrect } = params;
    const gainedXp = calculateScorePerSolve({ isCorrect });
    const weekInfo = getKstWeekInfo(solvedAt);
    const weekRepository = manager.getRepository(RankingWeek);
    const weeklyXpRepository = manager.getRepository(RankingWeeklyXp);

    const week = await this.findOrCreateWeek(weekRepository, weekInfo);
    const user = await this.findUserOrThrow(manager, userId);
    const tier = await this.findOrAssignTier(manager, user);

    const existingWeeklyXp = await weeklyXpRepository.findOne({
      where: { weekId: week.id, userId },
    });

    if (!existingWeeklyXp) {
      const createdWeeklyXp = weeklyXpRepository.create({
        weekId: week.id,
        userId,
        tierId: tier.id,
        xp: gainedXp,
        solvedCount: 1,
        firstSolvedAt: solvedAt,
        lastSolvedAt: solvedAt,
      });

      await weeklyXpRepository.save(createdWeeklyXp);
      return;
    }

    existingWeeklyXp.xp += gainedXp;
    existingWeeklyXp.solvedCount += 1;
    existingWeeklyXp.lastSolvedAt = solvedAt;
    if (!existingWeeklyXp.firstSolvedAt) {
      existingWeeklyXp.firstSolvedAt = solvedAt;
    }

    await weeklyXpRepository.save(existingWeeklyXp);
  }

  private async findOrCreateWeek(
    repository: Repository<RankingWeek>,
    weekInfo: { weekKey: string; startsAt: Date; endsAt: Date },
  ): Promise<RankingWeek> {
    const { weekKey, startsAt, endsAt } = weekInfo;

    const existing = await repository.findOne({ where: { weekKey } });
    if (existing) {
      return existing;
    }

    const created = repository.create({
      weekKey,
      startsAt,
      endsAt,
      status: RankingWeekStatus.OPEN,
      evaluatedAt: null,
    });

    return repository.save(created);
  }

  private async findUserOrThrow(manager: EntityManager, userId: number): Promise<User> {
    const userRepository = manager.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
    }

    return user;
  }

  private async findOrAssignTier(manager: EntityManager, user: User): Promise<RankingTier> {
    const tierRepository = manager.getRepository(RankingTier);
    const userRepository = manager.getRepository(User);

    if (user.currentTierId) {
      const currentTier = await tierRepository.findOne({ where: { id: user.currentTierId } });
      if (currentTier) {
        return currentTier;
      }
    }

    const defaultTier = await tierRepository.findOne({ where: { name: RankingTierName.BRONZE } });
    if (!defaultTier) {
      throw new NotFoundException('기본 티어 정보를 찾을 수 없습니다.');
    }

    user.currentTierId = defaultTier.id;
    await userRepository.save(user);

    return defaultTier;
  }

  private async findOrCreateTargetGroup(
    manager: EntityManager,
    week: RankingWeek,
    tier: RankingTier,
  ): Promise<RankingGroup> {
    const groupRepository = manager.getRepository(RankingGroup);
    const memberRepository = manager.getRepository(RankingGroupMember);

    const lastGroup = await groupRepository.findOne({
      where: { weekId: week.id, tierId: tier.id },
      order: { groupIndex: 'DESC' },
      lock: { mode: 'pessimistic_write' },
    });

    if (!lastGroup) {
      const created = groupRepository.create({
        weekId: week.id,
        tierId: tier.id,
        groupIndex: 1,
        capacity: tier.maxGroupSize,
      });

      return groupRepository.save(created);
    }

    const memberCount = await memberRepository.count({ where: { groupId: lastGroup.id } });
    if (memberCount < lastGroup.capacity) {
      return lastGroup;
    }

    const nextGroup = groupRepository.create({
      weekId: week.id,
      tierId: tier.id,
      groupIndex: lastGroup.groupIndex + 1,
      capacity: tier.maxGroupSize,
    });

    return groupRepository.save(nextGroup);
  }
}
