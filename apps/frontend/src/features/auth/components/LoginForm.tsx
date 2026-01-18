import { css, useTheme } from '@emotion/react';
import { memo } from 'react';

import { Button } from '@/comp/Button';
import SVGIcon from '@/comp/SVGIcon';
import type { Theme } from '@/styles/theme';

interface LoginFormProps {
  onGoogleLogin: () => void;
  onGitHubLogin: () => void;
}

export const LoginForm = memo(({ onGoogleLogin, onGitHubLogin }: LoginFormProps) => {
  const theme = useTheme();

  return (
    <div css={containerStyle()}>
      <div css={contentStyle()}>
        <div css={logoPlaceholderStyle(theme)}>
          <span css={emojiStyle}>📚</span>
        </div>
        <h1 css={titleStyle(theme)}>Funda</h1>
        <p css={taglineStyle(theme)}>재미있게 배우는 개발 지식</p>
        <div css={buttonGroupStyle}>
          <Button
            variant="secondary"
            onClick={onGoogleLogin}
            fullWidth
            css={loginButtonStyle}
            disabled
          >
            <SVGIcon icon="Google" size="md" />
            <span>Google로 계속하기</span>
          </Button>
          <Button variant="primary" onClick={onGitHubLogin} fullWidth css={loginButtonStyle}>
            <SVGIcon icon="Github" size="md" />
            <span>GitHub로 계속하기</span>
          </Button>
        </div>
        <p css={socialProofStyle(theme)}>10,000+명의 개발자가 함께 공부하고 있어요!</p>
      </div>
    </div>
  );
});

const containerStyle = () => css`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
`;

const contentStyle = () => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  max-width: 400px;
  width: 100%;
`;

const logoPlaceholderStyle = (theme: Theme) => css`
  width: 120px;
  height: 120px;
  background: ${theme.colors.surface.bold};
  border-radius: ${theme.borderRadius.large};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const emojiStyle = css`
  font-size: 60px;
`;

const titleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['32Bold'].fontSize};
  line-height: ${theme.typography['32Bold'].lineHeight};
  font-weight: ${theme.typography['32Bold'].fontWeight};
  color: ${theme.colors.primary.main};
  margin: 0;
`;

const taglineStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.light};
  margin: 0;
`;

const buttonGroupStyle = css`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  margin-top: 8px;
`;

const loginButtonStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const socialProofStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  color: ${theme.colors.text.weak};
  margin: 0;
  margin-top: 8px;
`;
