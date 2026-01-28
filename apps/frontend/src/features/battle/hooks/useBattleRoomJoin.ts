import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useJoinBattleRoomQuery } from '@/hooks/queries/battleQueries';
import { useSocketContext } from '@/providers/SocketProvider';
import { useAuthStore } from '@/store/authStore';
import { useBattleStore } from '@/store/battleStore';

export function useBattleRoomJoin(inviteToken: string) {
  const navigate = useNavigate();
  const { data } = useJoinBattleRoomQuery(inviteToken);
  const { joinRoom } = useSocketContext();
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const user = useAuthStore(state => state.user);
  const isAuthReady = useAuthStore(state => state.isAuthReady);
  const { setBattleState } = useBattleStore(state => state.actions);

  // 이미 join한 방 추적 (중복 join 방지)
  const currentRoomId = useBattleStore(state => state.roomId);

  useEffect(() => {
    if (!isAuthReady || !data) return;

    // canJoin 체크
    if (!data.canJoin) {
      navigate('/battle'); // 자동 리다이렉트
      return;
    }

    // 이미 같은 방에 join했으면 다시 join하지 않기
    if (currentRoomId === data.roomId) {
      return;
    }

    // 소켓 참여에 사용할 userId 계산
    const userId = isLoggedIn && user ? user.id : null;

    // battleStore에 roomId, inviteToken 저장
    setBattleState({
      roomId: data.roomId,
      inviteToken,
    });

    // 소켓 참여
    joinRoom(data.roomId, { userId }); // displayName 미전달 → 백엔드 자동 생성
  }, [data, isAuthReady, inviteToken, navigate, isLoggedIn, user, currentRoomId]);

  return { roomId: data?.roomId, canJoin: data?.canJoin };
}
