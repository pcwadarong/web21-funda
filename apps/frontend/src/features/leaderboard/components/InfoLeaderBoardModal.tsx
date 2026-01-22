import { css } from '@emotion/react';

import { MarkdownRenderer } from '@/comp/MarkdownRenderer';

import { leaderboardInfoContent } from './leaderboardInfo';

export const InfoLeaderBoardModal = () => (
  <div css={containerStyle}>
    <MarkdownRenderer text={leaderboardInfoContent} />
  </div>
);

const containerStyle = css`
  max-height: 70vh;
  overflow-y: auto;
  padding: 8px;
`;
