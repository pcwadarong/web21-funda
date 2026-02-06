import { useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const LoginCallback = () => {
  const navigate = useNavigate();
  const hasNavigatedRef = useRef(false);

  useLayoutEffect(() => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;

    // 세션 스토리지에서 로그인 후 이동할 경로를 가져옴
    const redirectTo = sessionStorage.getItem('loginRedirectPath');

    // 사용 후에는 즉시 삭제함
    if (redirectTo) {
      sessionStorage.removeItem('loginRedirectPath');
    }

    // 저장된 경로가 있으면 그곳으로, 없으면 기본 경로('/learn')로 이동
    navigate(redirectTo || '/learn', { replace: true });
  }, [navigate]);

  return null;
};
