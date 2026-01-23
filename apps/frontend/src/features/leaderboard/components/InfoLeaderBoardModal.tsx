import { css } from '@emotion/react';

import { MarkdownRenderer } from '@/comp/MarkdownRenderer';

import { leaderboardInfoContent } from './leaderboardInfo';

export const InfoLeaderBoardModal = () => (
  <section css={containerStyle} tabIndex={0} role="region" aria-label="리더보드 정보">
    <MarkdownRenderer text={leaderboardInfoContent} />
  </section>
);

const containerStyle = css`
  max-height: 70vh;
  overflow-y: auto;
  padding: 8px;
`;
