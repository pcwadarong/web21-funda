import { RankingSnapshotStatus } from './entities/ranking-snapshot-status.enum';
import { RankingTierRule } from './entities/ranking-tier-rule.entity';

export interface RankingMemberScore {
  userId: number;
  xp: number;
  lastSolvedAt: Date;
}

export interface RankingSnapshotDraft {
  userId: number;
  rank: number;
  xp: number;
  status: RankingSnapshotStatus;
  promoteCutXp: number | null;
  demoteCutXp: number | null;
}

const compareMembers = (left: RankingMemberScore, right: RankingMemberScore): number => {
  if (left.xp !== right.xp) {
    return right.xp - left.xp;
  }
  const leftTime = left.lastSolvedAt.getTime();
  const rightTime = right.lastSolvedAt.getTime();
  if (leftTime !== rightTime) {
    return leftTime - rightTime;
  }
  return left.userId - right.userId;
};

const toNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

/**
 * 랭킹 비율을 기준으로 승급/강등 인원 수를 계산한다.
 *
 * @param total 전체 인원
 * @param ratioString 비율(문자열)
 * @returns 계산된 인원 수
 */
type RoundingMode = 'ceil' | 'floor';

const applyRounding = (value: number, mode: RoundingMode): number => {
  if (mode === 'ceil') {
    return Math.ceil(value);
  }
  return Math.floor(value);
};

export const calculateTargetCount = (
  total: number,
  ratioString: string,
  roundingMode: RoundingMode,
): number => {
  if (total <= 0) {
    return 0;
  }

  const ratio = toNumber(ratioString);
  if (ratio <= 0) {
    return 0;
  }

  const raw = applyRounding(total * ratio, roundingMode);
  return Math.min(total, Math.max(1, raw));
};

const adjustDemoteCount = (total: number, promoteCount: number, demoteCount: number): number => {
  if (demoteCount <= 0) {
    return 0;
  }

  if (promoteCount <= 0) {
    return demoteCount;
  }

  const demoteStartRank = total - demoteCount + 1;
  if (demoteStartRank > promoteCount) {
    return demoteCount;
  }

  return Math.max(0, total - promoteCount);
};

/**
 * 그룹 내 사용자 점수 목록을 기반으로 스냅샷 초안을 만든다.
 *
 * @param params.members 그룹 내 사용자 목록(점수 포함)
 * @param params.rule 티어 룰셋
 * @returns 스냅샷 초안 목록
 */
export const buildRankingSnapshots = (params: {
  members: RankingMemberScore[];
  rule: RankingTierRule;
}): RankingSnapshotDraft[] => {
  const { members, rule } = params;
  if (members.length === 0) {
    return [];
  }

  const sortedMembers = [...members].sort(compareMembers);
  const total = sortedMembers.length;
  // 승급은 인원 수를 올림으로 계산
  const promoteCount = rule.isMaster ? 0 : calculateTargetCount(total, rule.promoteRatio, 'ceil');
  const demoteCount = adjustDemoteCount(
    total,
    promoteCount,
    // 강등은 인원 수를 내림으로 계산
    calculateTargetCount(total, rule.demoteRatio, 'floor'),
  );

  const promoteCandidates = promoteCount > 0 ? sortedMembers.slice(0, promoteCount) : [];
  const promoteCandidateMinXp =
    promoteCandidates.length > 0
      ? (promoteCandidates[promoteCandidates.length - 1]?.xp ?? null)
      : null;
  const promoteCutXp =
    promoteCandidateMinXp === null ? null : Math.max(rule.promoteMinXp, promoteCandidateMinXp);

  const demoteCutXp = rule.demoteMinXp;
  const demoteStartRank = demoteCount > 0 ? total - demoteCount + 1 : Number.POSITIVE_INFINITY;

  return sortedMembers.map((member, index) => {
    const rank = index + 1;
    const isPromoteCandidate = promoteCount > 0 && rank <= promoteCount;
    const isDemoteCandidate = demoteCount > 0 && rank >= demoteStartRank;

    let status = RankingSnapshotStatus.MAINTAINED;
    if (rule.isMaster) {
      if (member.xp < rule.demoteMinXp || isDemoteCandidate) {
        status = RankingSnapshotStatus.DEMOTED;
      }
    } else if (isPromoteCandidate && promoteCutXp !== null && member.xp >= promoteCutXp) {
      status = RankingSnapshotStatus.PROMOTED;
    } else if (member.xp < rule.demoteMinXp || isDemoteCandidate) {
      status = RankingSnapshotStatus.DEMOTED;
    }

    return {
      userId: member.userId,
      rank,
      xp: member.xp,
      status,
      promoteCutXp,
      demoteCutXp,
    };
  });
};
