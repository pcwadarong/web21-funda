import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ReviewCompletionEffect } from '@/feat/quiz/components/ReviewCompletionEffect';

/**
 * 리뷰 완료 결과 페이지
 * ReviewCompletionEffect를 표시하고 일정 시간 후 학습 페이지로 이동합니다.
 */
export const ReviewResult = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/learn', { replace: true });
    }, 2400);
    return () => clearTimeout(timer);
  }, [navigate]);

  return <ReviewCompletionEffect />;
};
