import { css, keyframes, useTheme } from '@emotion/react';

import { FundyPreviewCanvas } from '@/feat/fundy/components/FundyPreviewCanvas';
import type { Theme } from '@/styles/theme';

type QuizIntermissionProps = {
  message: string;
};

export const QuizIntermission = ({ message }: QuizIntermissionProps) => {
  const theme = useTheme();

  return (
    <div css={overlayStyle(theme)}>
      <div css={canvasWrapperStyle}>
        <FundyPreviewCanvas
          initialAnimation={{ lookAt: true }}
          autoHello={false}
          autoAction="peek"
          scale={0.4}
          position={[0.2, -0.5, 0]}
          riseOnMount
          riseFromY={-1.5}
          riseDurationMs={700}
          autoActionDelayMs={500}
          camera={{ position: [0, 1, 4.2], fov: 38 }}
          target={[0, 1.5, 0]}
        />
      </div>
      <div css={messageBubbleStyle(theme)}>{message}</div>
    </div>
  );
};

const overlayStyle = (theme: Theme) => css`
  position: fixed;
  inset: 0;
  z-index: 1200;
  width: 100vw;
  height: 100vh;
  background: ${theme.colors.surface.default};
  overflow: hidden;
`;

const canvasWrapperStyle = css`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

const bubbleRise = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, 32px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
`;

const messageBubbleStyle = (theme: Theme) => css`
  position: absolute;
  left: 33.333%;
  bottom: 56px;
  padding: 16px 28px;
  border-radius: 999px;
  background: ${theme.colors.grayscale[200]};
  color: ${theme.colors.text.default};
  font-size: ${theme.typography['16Medium'].fontSize};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  line-height: ${theme.typography['16Medium'].lineHeight};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  animation: ${bubbleRise} 600ms ease-out both;

  @media (max-width: 900px) {
    bottom: 32px;
  }
`;
