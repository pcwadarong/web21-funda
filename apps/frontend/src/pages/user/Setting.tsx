import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { SettingContainer } from '@/features/user/components/SettingContainer';
import { authService } from '@/services/authService';
import { useToast } from '@/store/toastStore';

export const Setting = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  //TODO: 실제 테마 상태와 연결 필요
  const isDarkMode = false;

  /**
   * 다크 모드 토글 핸들러
   * @param checked 다크 모드 체크 상태
   */
  const handleDarkModeToggle = useCallback((checked: boolean) => {
    console.log('Dark mode:', checked);
  }, []);

  /**
   * 로그아웃 핸들러
   */
  const handleLogout = useCallback(async () => {
    const isConfirmed = window.confirm('정말 로그아웃 하시겠습니까?');
    if (!isConfirmed) return;

    try {
      await authService.logout();
      navigate('/learn', { replace: true });
    } catch {
      showToast('로그아웃 중 오류가 발생했습니다.');
    }
  }, [navigate, showToast]);

  return (
    <SettingContainer
      isDarkMode={isDarkMode}
      onDarkModeToggle={handleDarkModeToggle}
      onLogout={handleLogout}
    />
  );
};
