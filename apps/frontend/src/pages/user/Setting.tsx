import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { SettingContainer } from '@/feat/user/components/setting/SettingContainer';
import { useLogoutMutation } from '@/hooks/queries/authQueries';
import { useStorage } from '@/hooks/useStorage';
import { useAuthActions } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useToast } from '@/store/toastStore';

export const Setting = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { clearAuth } = useAuthActions();
  const { soundVolume, setSoundVolume } = useStorage();

  const logoutMutation = useLogoutMutation();

  /**
   * 다크 모드 토글 핸들러
   * @param checked 다크 모드 체크 상태
   */
  const handleDarkModeToggle = useCallback(() => {
    toggleDarkMode();
  }, [toggleDarkMode]);

  /**
   * 효과음 볼륨 변경 핸들러
   *
   * @param volume 0.0~1.0 범위의 볼륨 값
   */
  const handleSoundVolumeChange = useCallback(
    (volume: number) => {
      setSoundVolume(volume);
    },
    [setSoundVolume],
  );

  /**
   * 로그아웃 핸들러
   */
  const handleLogout = useCallback(async () => {
    const isConfirmed = window.confirm('정말 로그아웃 하시겠습니까?');
    if (!isConfirmed) return;

    try {
      await logoutMutation.mutateAsync();
      clearAuth();
      navigate('/learn', { replace: true });
    } catch {
      showToast('로그아웃 중 오류가 발생했습니다.');
    }
  }, [navigate, showToast, clearAuth]);

  return (
    <SettingContainer
      isDarkMode={isDarkMode}
      onDarkModeToggle={handleDarkModeToggle}
      soundVolume={soundVolume}
      onSoundVolumeChange={handleSoundVolumeChange}
      onLogout={handleLogout}
    />
  );
};
