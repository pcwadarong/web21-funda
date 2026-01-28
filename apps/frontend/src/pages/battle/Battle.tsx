import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { battleService } from '@/services/battleService';

export const Battle = () => {
  const navigate = useNavigate();

  const createRoomMutation = useMutation({
    mutationFn: () => battleService.createBattleRoom(),
    onSuccess: data => {
      navigate(`/battle/${data.inviteToken}`);
    },
    onError: error => {
      alert(`방 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    },
  });

  return (
    <div style={{ textAlign: 'center', width: '100%', padding: '20px' }}>
      <h1>Battle</h1>
      <button
        onClick={() => createRoomMutation.mutate()}
        disabled={createRoomMutation.isPending}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          cursor: createRoomMutation.isPending ? 'not-allowed' : 'pointer',
          opacity: createRoomMutation.isPending ? 0.6 : 1,
        }}
      >
        {createRoomMutation.isPending ? '방 생성 중...' : '배틀 시작'}
      </button>
    </div>
  );
};
