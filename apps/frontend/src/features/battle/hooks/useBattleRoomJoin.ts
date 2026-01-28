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
  const participants = useBattleStore(state => state.participants);
  useEffect(() => {
    if (!isAuthReady || !data) return;

    // canJoin 체크
    if (!data.canJoin) {
      navigate('/battle'); // 자동 리다이렉트
      return;
    }

    // 소켓 참여에 사용할 사용자 정보
    const userId = isLoggedIn && user ? user.id : null;
    const displayName = isLoggedIn && user ? user.displayName : undefined;
    const profileImageUrl = isLoggedIn && user ? (user.profileImageUrl ?? undefined) : undefined;

    // 이미 같은 방에 join했으면 다시 join하지 않기
    if (currentRoomId === data.roomId && participants.length > 0) {
      return;
    }

    // 다른 방으로 진입하는 경우, 이전 상태 초기화
    if (currentRoomId && currentRoomId !== data.roomId) {
      useBattleStore.getState().actions.reset();
    }

    // battleStore에 roomId, inviteToken, settings 저장
    setBattleState({
      roomId: data.roomId,
      inviteToken,
      settings: data.settings,
    });

    // 소켓 참여
    joinRoom(data.roomId, { userId, displayName, profileImageUrl });
  }, [
    data,
    isAuthReady,
    inviteToken,
    navigate,
    isLoggedIn,
    user,
    currentRoomId,
    participants.length,
  ]);

  return { roomId: data?.roomId, canJoin: data?.canJoin };
}
