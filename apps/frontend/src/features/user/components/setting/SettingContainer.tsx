import { css } from '@emotion/react';
import { memo } from 'react';

import { Button } from '@/comp/Button';
import SVGIcon from '@/comp/SVGIcon';
import { useIsAuthReady, useIsLoggedIn } from '@/store/authStore';

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
    const isLoggedIn = useIsLoggedIn();
    const isAuthReady = useIsAuthReady();
    return (
      <div css={containerStyle}>
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

const logoutButtonStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;
