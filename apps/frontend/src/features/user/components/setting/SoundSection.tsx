import { css, useTheme } from '@emotion/react';
import type { ChangeEvent } from 'react';

import type { Theme } from '@/styles/theme';

import {
  contentGroupStyle,
  labelGroupStyle,
  rowStyle,
  sectionCardStyle,
  sectionTitleStyle,
} from './Setting.styles';

interface SoundSectionProps {
  soundVolume: number;
  onSoundVolumeChange: (volume: number) => void;
}

export const SoundSection = ({ soundVolume, onSoundVolumeChange }: SoundSectionProps) => {
  const theme = useTheme();
  const volumePercent = Math.round(soundVolume * 100);

  const handleSoundVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSoundVolumeChange(Number(event.target.value) / 100);
  };

  return (
    <section css={sectionCardStyle(theme)}>
      <h2 css={sectionTitleStyle(theme)}>사운드</h2>

      <div css={contentGroupStyle}>
        <div css={rowStyle}>
          <p css={labelGroupStyle}>효과음</p>
          <div css={volumeControlStyle}>
            <input
              type="range"
              min={0}
              max={100}
              value={volumePercent}
              onChange={handleSoundVolumeChange}
              css={volumeRangeStyle(theme)}
            />
            <span css={volumeValueStyle(theme)}>{volumePercent}%</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export const volumeControlStyle = css`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1 1 240px;
  justify-content: flex-end;
  min-width: 0;

  @media (max-width: 480px) {
    justify-content: space-between;
    width: 100%;
  }
`;

export const thumbStyle = (theme: Theme) => css`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${theme.colors.primary.main};
  border: 2px solid ${theme.colors.surface.strong};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  cursor: pointer;
`;

export const volumeRangeStyle = (theme: Theme) => css`
  appearance: none;
  width: 180px;
  max-width: 180px;
  min-width: 80px;
  height: 6px;
  border-radius: 999px;
  background: ${theme.colors.surface.default};

  &::-webkit-slider-thumb {
    appearance: none;
    ${thumbStyle(theme)};
  }

  &::-moz-range-thumb {
    ${thumbStyle(theme)};
  }
`;

const volumeValueStyle = (theme: Theme) => css`
  min-width: 48px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.default};
`;
