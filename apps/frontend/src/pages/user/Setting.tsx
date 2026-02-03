import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { Loading } from '@/comp/Loading';
import { SettingContainer } from '@/feat/user/setting/SettingContainer';
import { useLogoutMutation } from '@/hooks/queries/authQueries';
import { useStorage } from '@/hooks/useStorage';
import { useModal } from '@/store/modalStore';
import { useThemeStore } from '@/store/themeStore';
import { useToast } from '@/store/toastStore';

export const Setting = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { soundVolume, setSoundVolume } = useStorage();
  const { confirm } = useModal();

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
    const isConfirmed = await confirm({
      title: '로그아웃',
      content: '정말 로그아웃 하시겠습니까?',
      confirmText: '로그아웃',
    });
    if (!isConfirmed) return;

    try {
      navigate('/learn', { replace: true });
      await logoutMutation.mutateAsync();
    } catch {
      showToast('로그아웃 중 오류가 발생했습니다.');
    }
  }, [navigate, showToast, confirm, logoutMutation]);

  return (
    <>
      {logoutMutation.isPending && <Loading />}
      <SettingContainer
        isDarkMode={isDarkMode}
        onDarkModeToggle={handleDarkModeToggle}
        soundVolume={soundVolume}
        onSoundVolumeChange={handleSoundVolumeChange}
        onLogout={handleLogout}
      />
    </>
  );
};
