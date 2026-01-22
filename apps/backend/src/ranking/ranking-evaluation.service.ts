import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, LessThanOrEqual } from 'typeorm';

import { getKstNow } from '../common/utils/kst-date';
import { User } from '../users/entities/user.entity';

import { RankingGroup } from './entities/ranking-group.entity';
import { RankingGroupMember } from './entities/ranking-group-member.entity';
import { RankingRewardHistory } from './entities/ranking-reward-history.entity';
import { RankingRewardType } from './entities/ranking-reward-type.enum';
import { RankingSnapshotStatus } from './entities/ranking-snapshot-status.enum';
import { RankingTier } from './entities/ranking-tier.entity';
import { RankingTierName } from './entities/ranking-tier.enum';
import { RankingTierChangeHistory } from './entities/ranking-tier-change-history.entity';
import { RankingTierChangeReason } from './entities/ranking-tier-change-reason.enum';
import { RankingTierRule } from './entities/ranking-tier-rule.entity';
import { RankingWeek } from './entities/ranking-week.entity';
import { RankingWeekStatus } from './entities/ranking-week-status.enum';
import { RankingWeeklySnapshot } from './entities/ranking-weekly-snapshot.entity';
import { RankingWeeklyXp } from './entities/ranking-weekly-xp.entity';
import { buildRankingSnapshots, resolveTierChange } from './ranking-evaluation.utils';

@Injectable()
export class RankingEvaluationService {
  private readonly logger = new Logger(RankingEvaluationService.name);
  private readonly promotionRewardByTierOrder = new Map<number, number>([
    [1, 0],
    [2, 10],
    [3, 20],
    [4, 40],
    [5, 60],
    [6, 100],
  ]);

  private getPromotionRewardAmount(tier: RankingTier): number {
    // 보상 수량이 확정되기 전까지는 임시 정책을 사용한다.
    return this.promotionRewardByTierOrder.get(tier.orderIndex) ?? 0;
  }

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /**
   * 매주 월요일 00:05(KST)에 주간 평가 스냅샷을 생성한다.
   * - 종료된 주차 중 평가되지 않은 데이터만 처리한다.
   *
   * @returns {Promise<void>} 작업 완료
   */
  @Cron('5 0 * * 1', { timeZone: 'Asia/Seoul' })
  async handleWeeklyEvaluation(): Promise<void> {
    const now = getKstNow();
    const weekRepository = this.dataSource.getRepository(RankingWeek);

    const targetWeeks = await weekRepository.find({
      where: {
        status: In([RankingWeekStatus.OPEN, RankingWeekStatus.LOCKED]),
        endsAt: LessThanOrEqual(now),
      },
      order: { endsAt: 'ASC' },
    });

    for (const week of targetWeeks) {
      try {
        await this.evaluateWeek(week.id);
      } catch (error: unknown) {
        this.logger.error(
          `주간 평가 실패: weekId=${week.id}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }

  /**
   * 특정 주차의 랭킹 스냅샷을 생성한다.
   *
   * @param weekId 평가 대상 주차 ID
   * @returns {Promise<void>} 작업 완료
   */
  async evaluateWeek(weekId: number): Promise<void> {
    await this.dataSource.transaction(async manager => {
      const weekRepository = manager.getRepository(RankingWeek);
      const tierRepository = manager.getRepository(RankingTier);
      const ruleRepository = manager.getRepository(RankingTierRule);
      const groupRepository = manager.getRepository(RankingGroup);
      const memberRepository = manager.getRepository(RankingGroupMember);
      const weeklyXpRepository = manager.getRepository(RankingWeeklyXp);
      const snapshotRepository = manager.getRepository(RankingWeeklySnapshot);
      const tierChangeRepository = manager.getRepository(RankingTierChangeHistory);
      const userRepository = manager.getRepository(User);
      const rewardRepository = manager.getRepository(RankingRewardHistory);

      const week = await weekRepository.findOne({
        where: { id: weekId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!week) {
        return;
      }

      if (week.status === RankingWeekStatus.EVALUATED) {
        return;
      }

      week.status = RankingWeekStatus.LOCKED;
      await weekRepository.save(week);

      const tiers = await tierRepository.find({ order: { orderIndex: 'ASC' } });
      const rules = await ruleRepository.find();
      const ruleByTierId = new Map<number, RankingTierRule>(rules.map(rule => [rule.tierId, rule]));
      const tierById = new Map<number, RankingTier>(tiers.map(tier => [tier.id, tier]));

      const tierChanges: RankingTierChangeHistory[] = [];
      const rewardHistories: RankingRewardHistory[] = [];
      const userUpdates: Array<{ userId: number; tierId: number }> = [];
      const userRewardUpdates = new Map<number, number>();

      for (const tier of tiers) {
        const rule = ruleByTierId.get(tier.id);
        if (!rule) {
          this.logger.warn(`티어 룰셋이 없습니다: tierId=${tier.id}`);
          continue;
        }

        const groups = await groupRepository.find({
          where: { weekId: week.id, tierId: tier.id },
          order: { groupIndex: 'ASC' },
        });

        for (const group of groups) {
          const members = await memberRepository.find({
            where: { groupId: group.id },
            order: { joinedAt: 'ASC' },
          });

          if (members.length === 0) {
            continue;
          }

          const memberIds = members.map(member => member.userId);
          const weeklyXpList = await weeklyXpRepository.find({
            where: { weekId: week.id, userId: In(memberIds) },
          });
          const weeklyXpMap = new Map(weeklyXpList.map(item => [item.userId, item]));

          const scores = members.map(member => {
            const weeklyXp = weeklyXpMap.get(member.userId);
            const lastSolvedAt =
              weeklyXp?.lastSolvedAt ?? weeklyXp?.firstSolvedAt ?? member.joinedAt;

            return {
              userId: member.userId,
              xp: weeklyXp?.xp ?? 0,
              lastSolvedAt,
            };
          });

          const snapshotDrafts = buildRankingSnapshots({ members: scores, rule });
          const snapshots = snapshotDrafts.map(draft =>
            snapshotRepository.create({
              weekId: week.id,
              tierId: tier.id,
              groupId: group.id,
              userId: draft.userId,
              rank: draft.rank,
              xp: draft.xp,
              status: draft.status ?? RankingSnapshotStatus.MAINTAINED,
              promoteCutXp: draft.promoteCutXp,
              demoteCutXp: draft.demoteCutXp,
            }),
          );

          if (snapshots.length > 0) {
            await snapshotRepository.save(snapshots);
          }

          for (const draft of snapshotDrafts) {
            const tierChange = resolveTierChange({
              tiers,
              tierId: tier.id,
              status: draft.status,
            });

            tierChanges.push(
              tierChangeRepository.create({
                weekId: week.id,
                userId: draft.userId,
                fromTierId: tierChange.fromTierId,
                toTierId: tierChange.toTierId,
                reason: tierChange.reason,
              }),
            );

            if (tierChange.toTierId !== tierChange.fromTierId) {
              userUpdates.push({
                userId: draft.userId,
                tierId: tierChange.toTierId,
              });
            }

            const isMasterMaintain =
              tier.name === RankingTierName.MASTER &&
              tierChange.reason === RankingTierChangeReason.MAINTAIN;
            if (tierChange.reason === RankingTierChangeReason.PROMOTION || isMasterMaintain) {
              const rewardTier = isMasterMaintain ? tier : tierById.get(tierChange.toTierId);
              const rewardAmount = rewardTier ? this.getPromotionRewardAmount(rewardTier) : 0;
              rewardHistories.push(
                rewardRepository.create({
                  weekId: week.id,
                  userId: draft.userId,
                  tierId: rewardTier?.id ?? tier.id,
                  rewardType: RankingRewardType.DIAMOND,
                  amount: rewardAmount,
                }),
              );

              if (rewardAmount > 0) {
                const currentAmount = userRewardUpdates.get(draft.userId) ?? 0;
                userRewardUpdates.set(draft.userId, currentAmount + rewardAmount);
              }
            }
          }
        }
      }

      if (tierChanges.length > 0) {
        await tierChangeRepository.save(tierChanges);
      }

      if (rewardHistories.length > 0) {
        await rewardRepository.save(rewardHistories);
      }

      for (const [userId, amount] of userRewardUpdates.entries()) {
        await userRepository.increment({ id: userId }, 'diamondCount', amount);
      }

      for (const update of userUpdates) {
        await userRepository.update(update.userId, { currentTierId: update.tierId });
      }

      week.status = RankingWeekStatus.EVALUATED;
      week.evaluatedAt = getKstNow();
      await weekRepository.save(week);
    });
  }
}
