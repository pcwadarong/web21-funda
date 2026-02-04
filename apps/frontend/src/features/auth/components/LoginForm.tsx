import { css, useTheme } from '@emotion/react';
import { memo } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/comp/Button';
import SVGIcon from '@/comp/SVGIcon';
import type { Theme } from '@/styles/theme';

interface LoginFormProps {
  onGoogleLogin: () => void;
  onGitHubLogin: () => void;
  isLoggingIn: boolean;
}

export const LoginForm = memo(({ onGoogleLogin, onGitHubLogin, isLoggingIn }: LoginFormProps) => {
  const theme = useTheme();

  return (
    <main css={containerStyle()}>
      <section css={contentStyle()}>
        <div css={logoPlaceholderStyle(theme)}>
          <span css={emojiStyle}>📚</span>
        </div>
        <h1 css={titleStyle(theme)}>Funda</h1>
        <p css={taglineStyle(theme)}>재미있게 배우는 개발 지식</p>

        <div css={buttonGroupStyle} role="group" aria-label="로그인">
          <Button
            variant="secondary"
            onClick={onGoogleLogin}
            fullWidth
            css={loginButtonStyle}
            disabled
            aria-label="Google로 로그인 (현재 비활성)"
          >
            <SVGIcon icon="Google" size="md" aria-hidden="true" />
            <span>Google로 계속하기</span>
          </Button>
          <Button
            variant="primary"
            onClick={onGitHubLogin}
            fullWidth
            css={loginButtonStyle}
            disabled={isLoggingIn}
            aria-label={isLoggingIn ? 'GitHub 로그인 중' : 'GitHub로 로그인'}
            aria-busy={isLoggingIn}
          >
            <SVGIcon icon="Github" size="md" aria-hidden="true" />
            <span>GitHub로 {isLoggingIn ? '로그인 중..' : '계속하기'}</span>
          </Button>
        </div>

        <p css={policyTextStyle(theme)}>
          계속 진행하면 Funda의{' '}
          <Link to="/terms" css={linkStyle(theme)}>
            이용약관
          </Link>{' '}
          및{' '}
          <Link to="/privacy" css={linkStyle(theme)}>
            개인정보처리방침
          </Link>
          에 동의하며, <br /> 학습 독려를 위한 <strong>이메일 알림 수신</strong>에 동의하는 것으로
          간주됩니다.
        </p>
      </section>
    </main>
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
`;

const taglineStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.light};
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

const linkStyle = (theme: Theme) => css`
  color: ${theme.colors.primary.main};
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const policyTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
  text-align: center;
  word-break: keep-all;
  margin-top: 16px;
`;
