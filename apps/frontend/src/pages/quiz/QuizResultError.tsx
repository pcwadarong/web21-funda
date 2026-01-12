import { useNavigate } from 'react-router-dom';

import { ErrorView } from '@/feat/error/components/ErrorView';

export const QuizResultError = () => {
  const navigate = useNavigate();
  return (
    <ErrorView
      title="퀴즈 결과를 불러올 수 없어요"
      description={
        <>
          퀴즈는 모두 완료했지만
          <br />
          결과를 저장하는 과정에서 문제가 발생했어요.
        </>
      }
      primaryButtonText="메인으로 이동"
      onPrimaryButtonClick={() => navigate('/')}
    />
  );
};
