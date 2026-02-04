import { css, useTheme } from '@emotion/react';

import { Button } from '@/comp/Button';
import type { Theme } from '@/styles/theme';

export interface AuthCheckContainerProps {
  /** 로그인 후 돌아올 경로 (location.state.from) */
  from?: string;
  onLogin: () => void;
  onContinue: () => void;
}

export const AuthCheckContainer = ({ from, onLogin, onContinue }: AuthCheckContainerProps) => {
  const theme = useTheme();

  return (
    <section css={containerStyle()} aria-label="로그인 유도">
      <div css={contentStyle(theme)}>
        <div css={placeholderStyle(theme)} aria-hidden="true">
          <span css={emojiStyle} />
        </div>
        <div>
          <h1 css={titleStyle(theme)}>프로필을 생성하세요!</h1>
          <p css={descriptionStyle(theme)}>프로필을 만들어 학습 진도를 저장하고 계속 학습하세요!</p>
        </div>
        <div css={buttonGroupStyle} role="group" aria-label="로그인 선택">
          <Button variant="primary" onClick={onLogin} fullWidth>
            로그인하기
          </Button>
          <Button
            variant="secondary"
            onClick={onContinue}
            fullWidth
            aria-label={
              from === '/quiz' ? '그냥 사용할래요, 퀴즈로 이동' : '그냥 사용할래요, 학습으로 이동'
            }
          >
            그냥 사용할래요
          </Button>
        </div>
      </div>
    </section>
  );
};

const containerStyle = () => css`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
`;

const contentStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  max-width: 500px;
  width: 100%;
  color: ${theme.colors.text.light};
`;

const placeholderStyle = (theme: Theme) => css`
  width: 200px;
  height: 200px;
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.large};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const emojiStyle = css`
  font-size: 100px;
`;

const titleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['24Bold'].fontSize};
  line-height: ${theme.typography['24Bold'].lineHeight};
  font-weight: ${theme.typography['24Bold'].fontWeight};
  margin-bottom: 0.5rem;
`;

const descriptionStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Medium'].fontSize};
  line-height: ${theme.typography['20Medium'].lineHeight};
  font-weight: ${theme.typography['20Medium'].fontWeight};
`;

const buttonGroupStyle = css`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  margin-top: 8px;
`;
