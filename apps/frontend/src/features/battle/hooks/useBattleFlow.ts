import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import type { BattleRoomStatus } from '@/feat/battle/types';
import { useBattleStore } from '@/store/battleStore';

/**
 * useBattleFlow
 *
 * useBattleStore의 status를 구독하여 상태 변경 시 적절한 경로로 자동 라우팅합니다.
 * 배틀 관련 라우트 상위에서 한 번만 호출하여 중앙 집중식 라우팅을 관리합니다.
 */
export function useBattleFlow() {
  const navigate = useNavigate();
  const status = useBattleStore(state => state.status);
  const roomId = useBattleStore(state => state.roomId);
  const inviteToken = useBattleStore(state => state.inviteToken);
  const prevStatusRef = useRef<BattleRoomStatus | null>(null);

  useEffect(() => {
    // status가 변경되지 않았으면 리턴
    if (status === prevStatusRef.current) {
      return;
    }

    // roomId가 없으면 배틀 관련 상태가 아니므로 리턴
    if (!roomId) {
      prevStatusRef.current = status;
      return;
    }

    // status에 따라 적절한 경로로 navigate
    switch (status) {
      case 'waiting':
      case 'countdown':
        // waiting: inviteToken이 있으면 /battle/${inviteToken}, 없으면 /battle
        if (inviteToken) {
          navigate(`/battle/${inviteToken}`, { replace: true });
        } else {
          navigate('/battle', { replace: true });
        }
        break;
      case 'in_progress':
        navigate('/battle/quiz', { replace: true });
        break;
      case 'finished':
        navigate('/battle/result', { replace: true });
        break;
      case 'invalid':
        navigate('/battle', { replace: true });
        break;
      case null:
        // status가 null이면 배틀 상태가 아니므로 리턴
        break;
    }

    prevStatusRef.current = status;
  }, [status, roomId, inviteToken, navigate]);
}
