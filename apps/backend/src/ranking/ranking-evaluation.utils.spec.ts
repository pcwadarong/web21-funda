import { RankingSnapshotStatus } from './entities/ranking-snapshot-status.enum';
import { RankingTierRule } from './entities/ranking-tier-rule.entity';
import { buildRankingSnapshots } from './ranking-evaluation.utils';

const createRule = (override: Partial<RankingTierRule>): RankingTierRule =>
  ({
    promoteMinXp: 100,
    demoteMinXp: 50,
    promoteRatio: '0.4',
    demoteRatio: '0.4',
    isMaster: false,
    ...override,
  }) as RankingTierRule;

describe('buildRankingSnapshots', () => {
  it('승급 후보 최소 XP가 기준보다 높으면 승급 컷을 상향한다', () => {
    const rule = createRule({ promoteMinXp: 80 });
    const snapshots = buildRankingSnapshots({
      members: [
        { userId: 1, xp: 120, lastSolvedAt: new Date('2025-01-01') },
        { userId: 2, xp: 110, lastSolvedAt: new Date('2025-01-02') },
        { userId: 3, xp: 30, lastSolvedAt: new Date('2025-01-03') },
      ],
      rule,
    });

    const promoted = snapshots.filter(
      snapshot => snapshot.status === RankingSnapshotStatus.PROMOTED,
    );
    expect(promoted.length).toBe(2);
    expect(promoted[0]?.promoteCutXp).toBe(110);
  });

  it('XP 컷 미달이면 상대평가와 상관없이 강등된다', () => {
    const rule = createRule({ demoteMinXp: 50, promoteRatio: '0.3', demoteRatio: '0.3' });
    const snapshots = buildRankingSnapshots({
      members: [
        { userId: 1, xp: 120, lastSolvedAt: new Date('2025-01-01') },
        { userId: 2, xp: 40, lastSolvedAt: new Date('2025-01-02') },
        { userId: 3, xp: 35, lastSolvedAt: new Date('2025-01-03') },
      ],
      rule,
    });

    const demotedIds = snapshots
      .filter(snapshot => snapshot.status === RankingSnapshotStatus.DEMOTED)
      .map(snapshot => snapshot.userId);

    expect(demotedIds).toEqual([2, 3]);
  });

  it('마스터 티어는 승급이 없고 하락만 반영한다', () => {
    const rule = createRule({
      promoteRatio: '0.5',
      demoteRatio: '0.5',
      promoteMinXp: 0,
      demoteMinXp: 200,
      isMaster: true,
    });
    const snapshots = buildRankingSnapshots({
      members: [
        { userId: 1, xp: 300, lastSolvedAt: new Date('2025-01-01') },
        { userId: 2, xp: 150, lastSolvedAt: new Date('2025-01-02') },
      ],
      rule,
    });

    expect(snapshots[0]?.status).toBe(RankingSnapshotStatus.MAINTAINED);
    expect(snapshots[1]?.status).toBe(RankingSnapshotStatus.DEMOTED);
  });
});
