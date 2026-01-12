import { useNavigate } from 'react-router-dom';

import { ErrorView } from '@/feat/error/components/ErrorView';

interface QuizLoadErrorViewProps {
  onRetry?: () => void;
}

export const QuizLoadErrorView = ({ onRetry }: QuizLoadErrorViewProps) => {
  const navigate = useNavigate();

  return (
    <ErrorView
      title="퀴즈를 불러오지 못했습니다"
      description={
        <>
          네트워크 문제이거나
          <br />
          퀴즈가 아직 준비되지 않았을 수 있어요.
        </>
      }
      primaryButtonText="메인으로 이동"
      onPrimaryButtonClick={() => navigate('/learn')}
      secondaryButtonText="다시 시도"
      onSecondaryButtonClick={onRetry}
    />
  );
};
