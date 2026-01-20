import { css, useTheme } from '@emotion/react';

import type { Theme } from '@/styles/theme';

import {
  contentGroupStyle,
  labelGroupStyle,
  rowStyle,
  sectionCardStyle,
  sectionTitleStyle,
} from './Setting.styles';

interface AppearanceSectionProps {
  isDarkMode: boolean;
  onDarkModeToggle: (checked: boolean) => void;
}

export const AppearanceSection = ({ isDarkMode, onDarkModeToggle }: AppearanceSectionProps) => {
  const theme = useTheme();

  return (
    <section css={sectionCardStyle(theme)}>
      <h2 css={sectionTitleStyle(theme)}>화면</h2>

      <div css={contentGroupStyle}>
        <div css={rowStyle}>
          <p css={labelGroupStyle}>다크 모드</p>
          <label css={switchStyle(theme)}>
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={e => onDarkModeToggle(e.target.checked)}
            />
            <span className="slider" />
          </label>
        </div>
      </div>
    </section>
  );
};

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
    background-color: ${theme.colors.surface.bold};
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
