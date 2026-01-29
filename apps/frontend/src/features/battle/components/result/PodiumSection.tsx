import { css, keyframes } from '@emotion/react';

import SVGIcon from '@/comp/SVGIcon';
import { AvatarImage } from '@/feat/battle/components/result/AvatarImage';
import type { BattleParticipant, BattleReward, Ranking } from '@/feat/battle/types';
import { palette } from '@/styles/token';
import { typography } from '@/styles/typography';

const lightFlicker = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.8; }
`;

interface PodiumSectionProps {
  topThree: Ranking[];
  participants: BattleParticipant[];
  rewards: BattleReward[];
}

export const PodiumSection = ({ topThree, participants, rewards }: PodiumSectionProps) => {
  // participantId로 rewards 매핑
  const rewardMap = Object.fromEntries(rewards.map(r => [r.participantId, r]));

  // participants에서 participantId로 avatar 찾기
  const participantMap = Object.fromEntries(participants.map(p => [p.participantId, p]));

  // 시상대 순서: 2등 - 1등 - 3등 순으로 배치
  const podiumOrder = [topThree[1], topThree[0], topThree[2]];

  return (
    <div css={podiumAreaStyle}>
      {podiumOrder.map((ranking, idx) => {
        if (!ranking) return null;

        const participant = participantMap[ranking.participantId];
        const reward = rewardMap[ranking.participantId];

        return (
          <div key={ranking.participantId} css={podiumPillarWrapper(idx === 1)}>
            {idx === 1 && <div css={spotlightStyle} />}

            <div css={podiumAvatarStyle}>
              <AvatarImage src={participant?.avatar} alt={ranking.displayName} size="medium" />
            </div>

            <div css={podiumBoxStyle(idx)}>
              <div css={podiumStatsContainer}>
                <span css={podiumScoreStyle}>{ranking.score}</span>

                {reward && (
                  <div css={podiumRewardStyle}>
                    <SVGIcon icon="Diamond" size="md" />
                    <span css={podiumRewardAmount}>{reward.amount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const podiumAreaStyle = css`
  flex: 1.2;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 30px;
  position: relative;

  @media (max-width: 1300px) {
    display: none;
  }
`;

const podiumPillarWrapper = (isFirst: boolean) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px;
  position: relative;
  z-index: ${isFirst ? 2 : 1};
`;

const spotlightStyle = css`
  position: absolute;
  top: -800px;
  width: 400px;
  height: 1200px;

  clip-path: polygon(45% 0%, 55% 0%, 100% 100%, 0% 100%);

  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.5) 0%,
    rgba(178, 166, 255, 0.2) 60%,
    transparent 100%
  );

  filter: blur(30px);
  animation: ${lightFlicker} 4s infinite ease-in-out;
  pointer-events: none;
  z-index: 0;
  transform: translateX(-0%);
`;

const podiumAvatarStyle = css`
  width: 150px;
  height: 150px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: -30px;
  z-index: 3;
  overflow: hidden;
  box-shadow: 0 0 30px rgb(238, 243, 255);
`;

const podiumBoxStyle = (idx: number) => css`
  width: 100%;
  height: ${idx === 1 ? '360px' : idx === 0 ? '280px' : '200px'};
  background: ${palette.grayscale[500]};
  border-radius: 40px 40px 0 0;
  display: flex;
  justify-content: center;
  padding-top: 60px;
`;

const podiumStatsContainer = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const podiumScoreStyle = css`
  font-size: ${typography['36ExtraBold'].fontSize};
  font-weight: ${typography['36ExtraBold'].fontWeight};
  color: ${palette.primary.main};
  line-height: 1;
`;

const podiumRewardStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const podiumRewardAmount = css`
  font-size: ${typography['24Bold'].fontSize};
  font-weight: ${typography['24Bold'].fontWeight};
  color: ${palette.grayscale[50]};
  line-height: 1;
`;
