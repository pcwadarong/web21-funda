import { css } from '@emotion/react';

import BronzeMedal from '@/assets/images/bronze-medal.svg';
import GoldMedal from '@/assets/images/gold-medal.svg';
import SilverMedal from '@/assets/images/silver-medal.svg';
import { Button } from '@/comp/Button';
import { Avatar } from '@/components/Avatar';
import type { BattleParticipant, Ranking } from '@/feat/battle/types';
import { typography } from '@/styles/typography';

interface RankListSectionProps {
  rankings: Ranking[];
  participants: BattleParticipant[];
  timeLeft: number;
  onRestart: () => void;
  onLeave: () => void;
}

export const RankListSection = ({
  rankings,
  participants,
  timeLeft,
  onRestart,
  onLeave,
}: RankListSectionProps) => {
  const participantMap = Object.fromEntries(participants.map(p => [p.participantId, p]));

  const renderRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <img src={GoldMedal} alt="1등" css={medalStyle} />;
      case 2:
        return <img src={SilverMedal} alt="2등" css={medalStyle} />;
      case 3:
        return <img src={BronzeMedal} alt="3등" css={medalStyle} />;
      default:
        return <span css={rankNumberStyle}>{rank}</span>;
    }
  };

  return (
    <section css={contentSideStyle} aria-label="배틀 결과 순위">
      <h1 css={titleStyle} id="rank-list-title">
        참여 인원
      </h1>

      <div css={tableHeaderStyle} aria-hidden="true">
        <span>등수</span>
        <span>참가자</span>
        <span>점수</span>
      </div>

      <section css={listContainerStyle} aria-labelledby="rank-list-title">
        <ul css={participantListStyle}>
          {rankings.map((ranking, index) => {
            const participant = participantMap[ranking.participantId];
            const rank = index + 1;

            return (
              <li key={ranking.participantId} css={itemStyle}>
                <div css={rankBadgeAreaStyle} aria-hidden="true">
                  {renderRankBadge(rank)}
                </div>
                <div css={userInfoStyle}>
                  <div css={avatarCircleStyle}>
                    <Avatar
                      src={participant?.avatar}
                      name={ranking.displayName}
                      size="sm"
                      css={avatarCircleInnerStyle}
                      alt={ranking.displayName}
                    />
                  </div>
                  <span css={userNameStyle}>{ranking.displayName}</span>
                </div>
                <output
                  css={scoreValueStyle}
                  aria-label={`${ranking.displayName} 점수: ${ranking.score}`}
                >
                  {ranking.score}
                </output>
              </li>
            );
          })}
        </ul>
      </section>

      <p css={timerTextStyle} role="status" aria-live="polite" aria-atomic="true">
        {timeLeft}초 뒤 자동으로 대기실로 이동합니다
      </p>

      <div css={buttonGroupStyle} role="group" aria-label="결과 액션">
        <Button variant="secondary" fullWidth onClick={onRestart} aria-label="한 번 더 하기">
          한 번 더 하기
        </Button>
        <Button fullWidth onClick={onLeave} aria-label="게임 종료하고 대기실로 이동">
          게임 종료하기
        </Button>
      </div>
    </section>
  );
};

const contentSideStyle = css`
  max-width: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.2);
  padding: 40px;
  overflow-y: auto;
  color: #fff;
  @media (max-width: 1300px) {
    max-width: 100%;
  }
`;

const titleStyle = css`
  font-size: 32px;
  color: #b2a6ff;
  margin-bottom: 30px;
`;

const tableHeaderStyle = css`
  display: flex;
  justify-content: space-between;
  font-size: ${typography['16Medium'].fontSize};
  padding: 0 10px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  span:nth-of-type(2) {
    flex: 1;
    padding-left: 40px;
  }
`;

const listContainerStyle = css`
  flex: 1;
  overflow-y: auto;
  margin-top: 20px;
  padding-right: 10px;
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
`;

const participantListStyle = css`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const itemStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const rankBadgeAreaStyle = css`
  width: 50px;
  display: flex;
  justify-content: center;
`;

const medalStyle = css`
  width: 48px;
  height: 48px;
`;

const rankNumberStyle = css`
  font-size: 18px;
  font-weight: 700;
`;

const userInfoStyle = css`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 20px;
`;

const avatarCircleStyle = css`
  width: 44px;
  height: 44px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const avatarCircleInnerStyle = css`
  background: white;
`;

const userNameStyle = css`
  font-size: 18px;
  color: #fff;
`;

const scoreValueStyle = css`
  font-size: 20px;
  font-weight: 700;
  color: #8b87ff;
`;

const timerTextStyle = css`
  text-align: center;
  font-size: 14px;
  color: #aaa;
  margin: 20px 0;
`;

const buttonGroupStyle = css`
  display: flex;
  gap: 16px;
`;
