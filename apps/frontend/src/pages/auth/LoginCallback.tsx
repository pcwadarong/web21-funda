import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Loading } from '@/components/Loading';

export const LoginCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 세션 스토리지에서 로그인 후 이동할 경로를 가져옴
    const redirectTo = sessionStorage.getItem('loginRedirectPath');

    // 사용 후에는 즉시 삭제함
    if (redirectTo) {
      sessionStorage.removeItem('loginRedirectPath');
    }

    // 저장된 경로가 있으면 그곳으로, 없으면 기본 경로('/learn')로 이동
    navigate(redirectTo || '/learn', { replace: true });
  }, [navigate]);

  // 리다이렉트가 처리되는 동안 로딩 화면을 보여줌
  return (
    <div role="status" aria-label="로그인 처리 중">
      <Loading />
    </div>
  );
};
