import { css, keyframes, useTheme } from '@emotion/react';

import type { Theme } from '@/styles/theme';

interface ToastProps {
  message: string;
  isOpen: boolean;
}

export const Toast = ({ message, isOpen }: ToastProps) => {
  const theme = useTheme();

  return (
    <div css={toastWrapperStyle(isOpen)}>
      <div css={toastBodyStyle(theme, isOpen)} role="status" aria-live="polite">
        <span css={accentDotStyle(theme)} aria-hidden="true" />
        <span css={messageStyle(theme)}>{message}</span>
      </div>
    </div>
  );
};

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideDown = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
`;

const toastWrapperStyle = (isOpen: boolean) => css`
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 420px;
  z-index: 1100;
  display: flex;
  justify-content: center;
  pointer-events: ${isOpen ? 'auto' : 'none'};
`;

const toastBodyStyle = (theme: Theme, isOpen: boolean) => css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.medium};
  box-shadow: 0 12px 32px rgba(20, 20, 43, 0.18);
  border: 1px solid ${theme.colors.border.default};
  color: ${theme.colors.text.strong};
  animation: ${isOpen ? slideUp : slideDown} 0.3s ease-out forwards;
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
