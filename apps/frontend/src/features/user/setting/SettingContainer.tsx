import { css, useTheme } from '@emotion/react';
import { memo } from 'react';

import { Button } from '@/comp/Button';
import SVGIcon from '@/comp/SVGIcon';
import { useIsAuthReady, useIsLoggedIn } from '@/store/authStore';
import type { Theme } from '@/styles/theme';

import { AppearanceSection } from './AppearanceSection';
import { SoundSection } from './SoundSection';

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
    const isLoggedIn = useIsLoggedIn();
    const isAuthReady = useIsAuthReady();

    return (
      <div css={containerStyle}>
        <header css={headerStyle}>
          <h1 css={pageTitleStyle(theme)}>SETTING</h1>
        </header>
        <AppearanceSection isDarkMode={isDarkMode} onDarkModeToggle={onDarkModeToggle} />
        <SoundSection soundVolume={soundVolume} onSoundVolumeChange={onSoundVolumeChange} />

        {isAuthReady && isLoggedIn && (
          <Button variant="primary" fullWidth onClick={onLogout} css={logoutButtonStyle}>
            <SVGIcon icon="Logout" size="md" />
            <span>로그아웃</span>
          </Button>
        )}
      </div>
    );
  },
);

const containerStyle = css`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  max-width: 45rem;
  margin: 0 auto;
`;

const headerStyle = css`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const pageTitleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.primary.main};
  letter-spacing: 0.12em;
  padding-left: 0.5rem;
`;

const logoutButtonStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;
