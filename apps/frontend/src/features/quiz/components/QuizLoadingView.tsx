import { css } from '@emotion/react';

export const QuizLoadingView = () => (
  <div css={containerStyle}>
    <p>퀴즈를 불러오는 중입니다...</p>
  </div>
);

const containerStyle = css`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;
