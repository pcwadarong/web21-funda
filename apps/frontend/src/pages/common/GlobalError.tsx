import { useNavigate } from 'react-router-dom';

import { ErrorView } from '@/feat/error/components/ErrorView';

export const GlobalError = () => {
  const navigate = useNavigate();
  return (
    <ErrorView
      title="서비스 이용에 불편을 드려 죄송합니다."
      description={
        <>
          일시적인 오류가 발생했습니다.
          <br />
          잠시 후 다시 시도해 주세요.
        </>
      }
      primaryButtonText="메인으로 이동"
      onPrimaryButtonClick={() => navigate('/learn')}
      secondaryButtonText="다시 시도"
      onSecondaryButtonClick={() => window.location.reload()}
    />
  );
};
