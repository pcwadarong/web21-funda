import { css, keyframes, useTheme } from '@emotion/react';

import type { Theme } from '@/styles/theme';

interface BattleStartCountdownProps {
  isVisible: boolean;
  label: string;
}

export const BattleStartCountdown = ({ isVisible, label }: BattleStartCountdownProps) => {
  const theme = useTheme();

  if (!isVisible) {
    return null;
  }

  const isStartLabel = label === 'START';

  return (
    <div css={overlayStyle}>
      <div css={contentStyle}>
        <span key={label} css={labelStyle(theme, isStartLabel)}>
          {label}
        </span>
      </div>
    </div>
  );
};

const countdownPulse = keyframes`
  0% {
    transform: scale(0.7);
    opacity: 0;
  }
  35% {
    transform: scale(1.05);
    opacity: 1;
  }
  70% {
    transform: scale(1);
    opacity: 0.85;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.2;
  }
`;

const overlayStyle = css`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  z-index: 50;
  background: radial-gradient(
    circle at center,
    rgba(10, 10, 10, 0.2) 0%,
    rgba(10, 10, 10, 0.4) 70%,
    rgba(10, 10, 10, 0.6) 100%
  );
`;

const contentStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const labelStyle = (theme: Theme, isStartLabel: boolean) => css`
  font-size: 96px;
  font-weight: 800;
  letter-spacing: -2px;
  color: ${isStartLabel ? theme.colors.primary.main : theme.colors.text.default};
  text-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  animation: ${countdownPulse} 1s ease-in-out;

  @media (max-width: 768px) {
    font-size: 64px;
  }
`;
