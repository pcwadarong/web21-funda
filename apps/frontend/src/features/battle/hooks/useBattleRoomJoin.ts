import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useJoinBattleRoomQuery } from '@/hooks/queries/battleQueries';
import { useSocketContext } from '@/providers/SocketProvider';
import { useAuthStore } from '@/store/authStore';
import { useBattleStore } from '@/store/battleStore';

export function useBattleRoomJoin(inviteToken: string) {
  const navigate = useNavigate();
  const { data } = useJoinBattleRoomQuery(inviteToken);
  const { status, connect, emitEvent } = useSocketContext();
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const user = useAuthStore(state => state.user);
  const isAuthReady = useAuthStore(state => state.isAuthReady);
  const { setBattleState } = useBattleStore(state => state.actions);

  // 이미 join한 방 추적 (중복 join 방지)
  const currentRoomId = useBattleStore(state => state.roomId);
  const participants = useBattleStore(state => state.participants);

  // 소켓 연결 트리거: disconnected 상태일 때 connect() 호출
  useEffect(() => {
    if (!isAuthReady || !data || !data.canJoin) return;
    if (status === 'disconnected') connect();
  }, [status, isAuthReady, data, connect]);

  // 2. 소켓 연결 완료 후 battle:join 이벤트 발송 (status 기반 선언적 로직)
  useEffect(() => {
    if (!isAuthReady || !data || !data.canJoin) return;
    if (status !== 'connected') return;

    // 소켓 참여에 사용할 사용자 정보
    const userId = isLoggedIn && user ? user.id : null;
    const displayName = isLoggedIn && user ? user.displayName : undefined;
    const profileImageUrl = isLoggedIn && user ? (user.profileImageUrl ?? undefined) : undefined;

    // 이미 같은 방에 join했으면 다시 join하지 않기
    if (currentRoomId === data.roomId && participants.length > 0) return;

    // 다른 방으로 진입하는 경우, 이전 상태 초기화
    if (currentRoomId && currentRoomId !== data.roomId) useBattleStore.getState().actions.reset();

    // battleStore에 roomId, inviteToken, settings 저장
    setBattleState({
      roomId: data.roomId,
      inviteToken,
      settings: data.settings,
    });

    // 소켓 연결 완료 후 battle:join 이벤트 발송
    emitEvent('battle:join', {
      roomId: data.roomId,
      userId,
      displayName,
      profileImageUrl,
    });
  }, [
    status,
    isAuthReady,
    data,
    inviteToken,
    isLoggedIn,
    user,
    currentRoomId,
    participants.length,
    setBattleState,
    emitEvent,
  ]);

  // canJoin이 false일 때 /battle로 리다이렉트
  useEffect(() => {
    if (data && !data.canJoin) {
      navigate('/battle');
    }
  }, [data, navigate]);

  return { roomId: data?.roomId, canJoin: data?.canJoin };
}
