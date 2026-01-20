import { css, keyframes, useTheme } from '@emotion/react';

import { useThemeStore } from '@/store/themeStore';
import type { Theme } from '@/styles/theme';

export const Loading = ({ text = 'Loading' }: { text?: string }) => {
  const theme = useTheme();
  const { isDarkMode } = useThemeStore();

  return (
    <div css={containerStyle(theme)}>
      <div css={dotContainerStyle}>
        <div css={dotStyle(theme, isDarkMode)}></div>
        <div css={dotStyle(theme, isDarkMode)}></div>
        <div css={dotStyle(theme, isDarkMode)}></div>
      </div>
      <div css={textStyle(theme)}>
        {text}
        <div css={miniDotContainerStyle(theme)}>
          <div css={miniDotStyle(theme)}></div>
          <div css={miniDotStyle(theme)}></div>
          <div css={miniDotStyle(theme)}></div>
        </div>
      </div>
    </div>
  );
};

const containerStyle = (theme: Theme) => css`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  background: ${theme.colors.surface.default};
`;

const dotContainerStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  & > div:nth-of-type(2) {
    animation-delay: 0.15s;
  }

  & > div:nth-of-type(3) {
    animation-delay: 0.3s;
  }
`;

const dotStyle = (theme: Theme, isDarkMode: boolean) => css`
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: ${isDarkMode ? theme.colors.grayscale[600] : theme.colors.grayscale[400]};
  animation: ${blink} 1.2s infinite ease-in-out;
  will-change: transform, opacity;
`;

const miniDotContainerStyle = (theme: Theme) => css`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.1rem;
  height: ${theme.typography['12Medium'].fontSize};

  & > div:nth-of-type(2) {
    animation-delay: 0.15s;
  }

  & > div:nth-of-type(3) {
    animation-delay: 0.3s;
  }
`;

const miniDotStyle = (theme: Theme) => css`
  width: 0.2rem;
  height: 0.2rem;
  border-radius: 50%;
  background-color: ${theme.colors.text.weak};
  animation: ${blink} 1.2s infinite ease-in-out;
  will-change: transform, opacity;
`;

const textStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  color: ${theme.colors.text.weak};
  font-size: ${theme.typography['16Medium'].fontSize};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  line-height: ${theme.typography['16Medium'].lineHeight};
`;

const blink = keyframes`
  0% {
   opacity: 0.3;
   transform: scale(0.8);
  }
  50% {
   opacity: 1;
   transform: scale(1);
  }
  100% {
   opacity: 0.3;
   transform: scale(0.8);
  }
`;
