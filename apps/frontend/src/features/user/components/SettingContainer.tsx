import { css, useTheme } from '@emotion/react';
import { type ChangeEvent, memo } from 'react';

import { Button } from '@/comp/Button';
import SVGIcon from '@/comp/SVGIcon';
import type { Theme } from '@/styles/theme';

interface SettingProps {
  isDarkMode: boolean;
  onDarkModeToggle: (checked: boolean) => void;
  onLogout: () => void;
  soundVolume: number;
  onSoundVolumeChange: (volume: number) => void;
}

export const SettingContainer = memo(
  ({ isDarkMode, onDarkModeToggle, onLogout, soundVolume, onSoundVolumeChange }: SettingProps) => {
    const theme = useTheme();
    const volumePercent = Math.round(soundVolume * 100);

    const handleSoundVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
      const rawValue = Number(event.target.value);
      const normalizedVolume = rawValue / 100;
      onSoundVolumeChange(normalizedVolume);
    };

    return (
      <div css={containerStyle}>
        <section css={sectionCardStyle(theme)}>
          <h2 css={sectionTitleStyle(theme)}>화면</h2>
          <div css={rowStyle}>
            <div css={labelGroupStyle(theme)}>다크 모드</div>
            <label css={switchStyle(theme)}>
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={e => onDarkModeToggle(e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>
        </section>

        <section css={sectionCardStyle(theme)}>
          <h2 css={sectionTitleStyle(theme)}>사운드</h2>
          <div css={rowStyle}>
            <div css={labelGroupStyle(theme)}>효과음</div>
            <div css={volumeControlStyle}>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={volumePercent}
                onChange={handleSoundVolumeChange}
                css={volumeRangeStyle(theme)}
                aria-label="효과음 볼륨"
              />
              <span css={volumeValueStyle(theme)}>{volumePercent}%</span>
            </div>
          </div>
        </section>

        <Button variant="primary" fullWidth onClick={onLogout} css={logoutButtonStyle}>
          <SVGIcon icon="Logout" size="md" />
          <span>로그아웃</span>
        </Button>
      </div>
    );
  },
);

SettingContainer.displayName = 'SettingContainer';

const containerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  flex: 1;
  width: 100%;
  max-width: 45rem;
  margin: 0 auto;
  min-height: 100vh;
`;

const sectionCardStyle = (theme: Theme) => css`
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.large};
  padding: 20px 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
`;

const sectionTitleStyle = (theme: Theme) => css`
  color: ${theme.colors.primary.main};
  font-size: 14px;
  margin-bottom: 16px;
  font-weight: 600;
`;

const rowStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const volumeControlStyle = css`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const labelGroupStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: ${theme.colors.text.default};
`;

const volumeRangeStyle = (theme: Theme) => css`
  appearance: none;
  width: 180px;
  height: 6px;
  border-radius: 999px;
  background: ${theme.colors.surface.default};

  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${theme.colors.primary.main};
    border: 2px solid ${theme.colors.surface.strong};
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${theme.colors.primary.main};
    border: 2px solid ${theme.colors.surface.strong};
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    cursor: pointer;
  }
`;

const volumeValueStyle = (theme: Theme) => css`
  min-width: 48px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.default};
`;

const switchStyle = (theme: Theme) => css`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #f1f1f5;
    transition: 0.3s;
    border-radius: 24px;
  }

  .slider:before {
    position: absolute;
    content: '';
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  input:checked + .slider {
    background-color: ${theme.colors.primary.main};
  }

  input:checked + .slider:before {
    transform: translateX(20px);
  }
`;

const logoutButtonStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;
