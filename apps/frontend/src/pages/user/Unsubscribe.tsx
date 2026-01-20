import { useNavigate, useSearchParams } from 'react-router-dom';

import { UnsubscribeContainer } from '@/features/user/components/subscribe/UnsubscribeContainer';
import { notificationService } from '@/services/userService';
import { useToast } from '@/store/toastStore';

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleUnsubscribe = async () => {
    if (!email) {
      showToast('유효하지 않은 이메일 주소입니다.');
      return;
    }

    try {
      await notificationService.unsubscribe({ email });
      showToast('정상적으로 수신 거부되었습니다.');
      navigate('/learn');
    } catch {
      showToast('수신 거부 처리 중 오류가 발생했습니다.');
    }
  };

  return <UnsubscribeContainer email={email} onUnsubscribe={handleUnsubscribe} />;
}
