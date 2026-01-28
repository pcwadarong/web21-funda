import { css } from '@emotion/react';

import { useBattleStore } from '@/store/battleStore';

export const BattleResultPage = () => {
  const { rankings, rewards } = useBattleStore();

  return (
    <div css={containerStyle}>
      <h1 css={titleStyle}>배틀 결과</h1>

      <section css={sectionStyle}>
        <h2 css={sectionTitleStyle}>순위</h2>
        {rankings.length === 0 ? (
          <p>결과 데이터가 없습니다.</p>
        ) : (
          <ol css={listStyle}>
            {rankings.map((ranking, index) => (
              <li key={ranking.participantId}>
                {index + 1}등 {ranking.displayName} - {ranking.score}점
              </li>
            ))}
          </ol>
        )}
      </section>

      <section css={sectionStyle}>
        <h2 css={sectionTitleStyle}>보상</h2>
        {rewards.length === 0 ? (
          <p>지급된 보상이 없습니다.</p>
        ) : (
          <ul css={listStyle}>
            {rewards.map(reward => (
              <li key={`${reward.participantId}-${reward.rewardType}`}>
                {reward.participantId} : {reward.rewardType} {reward.amount}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

const containerStyle = css`
  width: 100%;
  min-height: 100vh;
  background: #ffffff;
  color: #111827;
  padding: 32px;
`;

const titleStyle = css`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
`;

const sectionStyle = css`
  margin-bottom: 24px;
`;

const sectionTitleStyle = css`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const listStyle = css`
  padding-left: 20px;
`;
