import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { UnsubscribeContainer } from '@/features/user/components/subscribe/UnsubscribeContainer';
import { useUnsubscribeMutation } from '@/hooks/queries/userQueries';
import { useToast } from '@/store/toastStore';

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { showToast } = useToast();
  //TODO: tanstack query로 수정
  const [isLoading, setIsLoading] = useState(false);

  const unsubscribeMutation = useUnsubscribeMutation();

  const handleUnsubscribe = async () => {
    if (!email || !token) {
      showToast('유효하지 않은 접근입니다. 메일의 링크를 다시 확인해주세요.');
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      await unsubscribeMutation.mutateAsync({ email, token });
      showToast('정상적으로 수신 거부되었습니다.');
      navigate('/learn');
    } catch {
      showToast('링크가 만료되었거나 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UnsubscribeContainer email={email} onUnsubscribe={handleUnsubscribe} isLoading={isLoading} />
  );
}
