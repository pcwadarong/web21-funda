import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, LessThanOrEqual } from 'typeorm';

import { getKstNow } from '../common/utils/kst-date';

import { RankingGroup } from './entities/ranking-group.entity';
import { RankingGroupMember } from './entities/ranking-group-member.entity';
import { RankingSnapshotStatus } from './entities/ranking-snapshot-status.enum';
import { RankingTier } from './entities/ranking-tier.entity';
import { RankingTierRule } from './entities/ranking-tier-rule.entity';
import { RankingWeek } from './entities/ranking-week.entity';
import { RankingWeekStatus } from './entities/ranking-week-status.enum';
import { RankingWeeklySnapshot } from './entities/ranking-weekly-snapshot.entity';
import { RankingWeeklyXp } from './entities/ranking-weekly-xp.entity';
import { buildRankingSnapshots } from './ranking-evaluation.utils';

@Injectable()
export class RankingEvaluationService {
  private readonly logger = new Logger(RankingEvaluationService.name);

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
        }
      }

      week.status = RankingWeekStatus.EVALUATED;
      week.evaluatedAt = getKstNow();
      await weekRepository.save(week);
    });
  }
}
