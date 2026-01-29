import { css } from '@emotion/react';

import { PodiumSection } from '@/feat/battle/components/result/PodiumSection';
import { RankListSection } from '@/feat/battle/components/result/RankListSection';
import type { BattleParticipant, BattleReward, Ranking } from '@/feat/battle/types';

interface BattleResultContainerProps {
  rankings: Ranking[];
  participants: BattleParticipant[];
  rewards: BattleReward[];
  timeLeft: number;
  onRestart: () => void;
  onLeave: () => void;
}

export const BattleResultContainer = ({
  rankings,
  participants,
  rewards,
  timeLeft,
  onRestart,
  onLeave,
}: BattleResultContainerProps) => {
  // 상위 3명 추출
  const sortedRankings = [...rankings].sort((a, b) => b.score - a.score);
  const topThree = sortedRankings.slice(0, 3);

  return (
    <main css={mainLayoutStyle}>
      <PodiumSection topThree={topThree} participants={participants} rewards={rewards} />
      <RankListSection
        rankings={sortedRankings}
        participants={participants}
        timeLeft={timeLeft}
        onRestart={onRestart}
        onLeave={onLeave}
      />
    </main>
  );
};

const mainLayoutStyle = css`
  display: flex;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(235deg, #0f0c29, #2a294e, #9f9db9);
  overflow: hidden;
  gap: 40px;

  @media (max-width: 768px) {
    padding-bottom: 105px;
  }
`;
