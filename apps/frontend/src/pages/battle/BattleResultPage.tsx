import { css, keyframes } from '@emotion/react';
import { useEffect, useState } from 'react';

import BronzeMedal from '@/assets/bronze-medal.svg';
import GoldMedal from '@/assets/gold-medal.svg';
import SilverMedal from '@/assets/silver-medal.svg';
import { Button } from '@/comp/Button';
import SVGIcon from '@/comp/SVGIcon';
// import { useBattleStore } from '@/store/battleStore';
import { palette } from '@/styles/token';
import { typography } from '@/styles/typography';

const lightFlicker = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.8; }
`;

export const BattleResultPage = () => {
  // const { participants, rewards } = useBattleStore();
  const [timeLeft, setTimeLeft] = useState(15);

  const mockParticipants = [
    {
      participantId: 'p1',
      displayName: 'MIML',
      score: 50,
      avatar: 'https://avatars.githubusercontent.com/u/829567548?v=4',
      isHost: true,
      userId: 1,
      isConnected: true,
      joinedAt: Date.now(),
      leftAt: null,
    },
    {
      participantId: 'p2',
      displayName: 'Foxxy',
      score: 40,
      avatar: 'https://avatars.githubusercontent.com/u/65771223?v=4',
      isHost: false,
      userId: 2,
      isConnected: true,
      joinedAt: Date.now(),
      leftAt: null,
    },
    {
      participantId: 'p3',
      displayName: 'LittleStar',
      score: 20,
      avatar: 'https://avatars.githubusercontent.com/u/82956755?v=4',
      isHost: false,
      userId: 3,
      isConnected: true,
      joinedAt: Date.now(),
      leftAt: null,
    },
    {
      participantId: 'p4',
      displayName: 'Panda',
      score: 20,
      avatar: 'https://avatars.githubusercontent.com/u/86795558?v=4',
      isHost: false,
      userId: 4,
      isConnected: true,
      joinedAt: Date.now(),
      leftAt: null,
    },
  ];

  const mockRewards = [
    { participantId: 'p1', rewardType: 'diamond', amount: 2 },
    { participantId: 'p2', rewardType: 'diamond', amount: 1 },
  ];

  // 타이머 로직: 1초마다 감소
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const rewardMap = Object.fromEntries(mockRewards.map(r => [r.participantId, r]));

  const topThree = [...mockParticipants].sort((a, b) => b.score - a.score).slice(0, 3);
  // 시상대 순서: 2등 - 1등 - 3등 순으로 배치 (이미지 참고)
  const podiumOrder = [topThree[1], topThree[0], topThree[2]];

  const renderRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <img src={GoldMedal} alt="1st" css={medalStyle} />;
      case 2:
        return <img src={SilverMedal} alt="2nd" css={medalStyle} />;
      case 3:
        return <img src={BronzeMedal} alt="3rd" css={medalStyle} />;
      default:
        return <span css={rankNumberStyle}>{rank}</span>;
    }
  };

  // 아바타 이미지 컴포넌트
  const AvatarImage = ({ src, alt }: { src?: string; alt: string }) => (
    <div css={avatarWrapperStyle}>
      {src ? (
        <img src={src} alt={alt} css={imageStyle} />
      ) : (
        <div css={fallbackStyle}>👤</div> // 이미지 없을 때
      )}
    </div>
  );

  return (
    <main css={mainLayoutStyle}>
      {/* 좌측: 시상대 영역 */}
      <div css={podiumAreaStyle}>
        {podiumOrder.map((player, idx) => {
          const reward = player ? rewardMap[player.participantId] : null;

          return (
            <div key={player?.participantId || idx} css={podiumPillarWrapper(idx === 1)}>
              {idx === 1 && <div css={spotlightStyle} />}

              <div css={podiumAvatarStyle}>
                <AvatarImage src={player?.avatar} alt={player?.displayName || 'user'} />
              </div>

              <div css={podiumBoxStyle(idx)}>
                <div css={podiumStatsContainer}>
                  <span css={podiumScoreStyle}>+{player?.score}</span>

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

      {/* 우측: 랭킹 리스트 및 버튼 영역 */}
      <div css={contentSideStyle}>
        <h1 css={titleStyle}>참여 인원</h1>

        <div css={tableHeaderStyle}>
          <span>등수</span>
          <span>참가자</span>
          <span>점수</span>
        </div>

        <section css={listContainerStyle}>
          <ul css={participantListStyle}>
            {mockParticipants.map((participant, index) => (
              <li key={participant.participantId} css={itemStyle}>
                <div css={rankBadgeAreaStyle}>{renderRankBadge(index + 1)}</div>
                <div css={userInfoStyle}>
                  <div css={avatarCircleStyle}>
                    <AvatarImage src={participant.avatar} alt={participant.displayName} />
                  </div>
                  <span css={userNameStyle}>{participant.displayName}</span>
                </div>
                <div css={scoreValueStyle}>+{participant.score}</div>
              </li>
            ))}
          </ul>
        </section>

        <p css={timerTextStyle}>{timeLeft}초 뒤 자동으로 대기실로 이동합니다</p>

        <div css={buttonGroupStyle}>
          <Button variant="secondary" fullWidth>
            한 번 더 하기
          </Button>
          <Button fullWidth>게임 종료하기</Button>
        </div>
      </div>
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
    padding-bottom: 120px;
  }
`;

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

const avatarWrapperStyle = css`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const imageStyle = css`
  width: 100%;
  height: 100%;
  object-fit: cover; // 비율 유지하며 꽉 채움
`;

const fallbackStyle = css`
  font-size: 80px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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
  overflow: hidden; // 필수
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

export const podiumStatsContainer = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

export const podiumScoreStyle = css`
  font-size: ${typography['36ExtraBold'].fontSize};
  font-weight: ${typography['36ExtraBold'].fontWeight};
  color: ${palette.primary.main};
  line-height: 1;
`;

export const podiumRewardStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const podiumRewardAmount = css`
  font-size: ${typography['24Bold'].fontSize};
  font-weight: ${typography['24Bold'].fontWeight};
  color: ${palette.grayscale[50]};
  line-height: 1;
`;

const contentSideStyle = css`
  max-width: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.2);
  padding: 40px;
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
  overflow: hidden; // 필수
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
