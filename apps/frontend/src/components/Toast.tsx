import { css, useTheme } from '@emotion/react';

import type { Theme } from '@/styles/theme';

interface ToastProps {
  message: string;
  isOpen: boolean;
}

export const Toast = ({ message, isOpen }: ToastProps) => {
  const theme = useTheme();

  if (!isOpen) {
    return null;
  }

  return (
    <div css={toastWrapperStyle}>
      <div css={toastBodyStyle(theme)} role="status" aria-live="polite">
        <span css={accentDotStyle(theme)} aria-hidden="true" />
        <span css={messageStyle(theme)}>{message}</span>
      </div>
    </div>
  );
};

const toastWrapperStyle = css`
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 420px;
  z-index: 1100;
  display: flex;
  justify-content: center;
`;

const toastBodyStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.medium};
  box-shadow: 0 12px 32px rgba(20, 20, 43, 0.18);
  border: 1px solid ${theme.colors.border.default};
  color: ${theme.colors.text.strong};
`;

const accentDotStyle = (theme: Theme) => css`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.primary.light});
  flex-shrink: 0;
`;

const messageStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.strong};
`;
