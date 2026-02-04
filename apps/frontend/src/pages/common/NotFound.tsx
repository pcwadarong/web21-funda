import { useNavigate } from 'react-router-dom';

import { ErrorView } from '@/feat/error/components/ErrorView';

export const NotFound = () => {
  const navigate = useNavigate();
  return (
    <section aria-label="페이지 없음">
      <ErrorView
        title="페이지를 찾을 수 없습니다."
        description={
          <>
            요청하신 페이지가 존재하지 않거나
            <br />
            접근할 수 없는 페이지입니다.
          </>
        }
        primaryButtonText="학습 메인으로 이동"
        onPrimaryButtonClick={() => navigate('/learn')}
      />
    </section>
  );
};
