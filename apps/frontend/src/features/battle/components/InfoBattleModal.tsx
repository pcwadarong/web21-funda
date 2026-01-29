import { css } from '@emotion/react';

import { MarkdownRenderer } from '@/comp/MarkdownRenderer';

import { battleInfoContent } from '../utils/battleInfo';

export const InfoBattleModal = () => (
  <section css={containerStyle} tabIndex={0} role="region" aria-label="실시간 배틀 정보">
    <MarkdownRenderer text={battleInfoContent} />
  </section>
);

const containerStyle = css`
  max-height: 70vh;
  overflow-y: auto;
  padding: 8px;
`;
