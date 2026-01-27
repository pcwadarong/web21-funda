import { useCallback, useEffect } from 'react';

import { useSocketContext } from '@/providers/SocketProvider';
import { type BattleRoomStatus, useBattleStore } from '@/store/battleStore';

/**
 * useBattleSocket Hook의 반환 타입
 */
export interface UseBattleSocketReturn {
  socket: ReturnType<typeof useSocketContext>['socket'];
  status: ReturnType<typeof useSocketContext>['status'];
  battleStatus: BattleRoomStatus | null;
  error: ReturnType<typeof useSocketContext>['error'];
  roomId: ReturnType<typeof useSocketContext>['roomId'];
  connect: ReturnType<typeof useSocketContext>['connect'];
  disconnect: ReturnType<typeof useSocketContext>['disconnect'];
  joinRoom: ReturnType<typeof useSocketContext>['joinRoom'];
  leaveRoom: ReturnType<typeof useSocketContext>['leaveRoom'];
}

/**
 * useBattleSocket Hook
 *
 * Battle 도메인 비즈니스 로직을 관리하는 훅입니다.
 * SocketProvider의 소켓 인프라를 사용하여 Battle 상태를 관리합니다.
 *
 * - Battle 상태 (waiting, in_progress, finished, invalid) 관리
 * - Battle 이벤트 리스너 설정
 * - SocketProvider의 소켓 인프라 활용
 */
export function useBattleSocket(): UseBattleSocketReturn {
  // SocketProvider의 소켓 인프라 사용
  const socketContext = useSocketContext();
  const { socket } = socketContext;

  // Zustand 스토어에서 Battle 상태 가져오기
  const battleStatus = useBattleStore(state => state.battleStatus);
  const { setBattleStatus, reset } = useBattleStore(state => state.actions);

  /**
   * Battle 이벤트 리스너 설정
   * socket 인스턴스가 변경될 때마다 리스너 재설정
   */
  useEffect(() => {
    if (!socket) return;

    // 게임 상태 업데이트 (시작/재시작 시)
    const handleBattleState = (data: { status: BattleRoomStatus; roomId: string }) =>
      setBattleStatus(data.status);

    // 게임 종료
    const handleBattleFinish = () => setBattleStatus('finished');

    // 방이 유효하지 않음
    const handleBattleInvalid = () => setBattleStatus('invalid');

    // 참가자 업데이트 (방 상태가 waiting일 수 있음)
    const handleParticipantsUpdated = () => {
      // 현재 상태가 null이면 'waiting'으로 설정
      if (battleStatus === null) setBattleStatus('waiting');
    };

    // 에러 발생
    const handleBattleError = (error: { code: string; message: string }) => {
      console.error('[Battle Socket] Error:', error);

      // 특정 에러 코드에 따라 상태 변경
      if (error.code === 'ROOM_FULL' || error.code === 'ROOM_NOT_JOINABLE')
        setBattleStatus('invalid');
    };

    // 연결 해제 시 상태 초기화
    const handleDisconnect = () => setBattleStatus(null);

    // 연결 오류 시 상태 설정
    const handleConnectError = () => setBattleStatus('invalid');

    // 이벤트 리스너 등록
    socket.on('battle:state', handleBattleState);
    socket.on('battle:finish', handleBattleFinish);
    socket.on('battle:invalid', handleBattleInvalid);
    socket.on('battle:participantsUpdated', handleParticipantsUpdated);
    socket.on('battle:error', handleBattleError);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // 클린업 함수
    return () => {
      socket.off('battle:state', handleBattleState);
      socket.off('battle:finish', handleBattleFinish);
      socket.off('battle:invalid', handleBattleInvalid);
      socket.off('battle:participantsUpdated', handleParticipantsUpdated);
      socket.off('battle:error', handleBattleError);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [socket, battleStatus, setBattleStatus]);

  /**
   * Socket 연결 해제 (Battle 상태도 함께 초기화)
   */
  const disconnect = useCallback(() => {
    socketContext.disconnect();
    reset();
  }, [socketContext, reset]);

  return {
    ...socketContext,
    battleStatus,
    disconnect,
  };
}
