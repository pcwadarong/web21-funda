import { useCallback, useEffect } from 'react';

import type {
  BattleParticipant,
  BattleRoomSettings,
  BattleRoomStatus,
  Ranking,
} from '@/feat/battle/types';
import { useSocketContext } from '@/providers/SocketProvider';
import { useBattleStore } from '@/store/battleStore';

export function useBattleSocket() {
  const socketContext = useSocketContext();
  const { socket } = socketContext;

  // Zustand 스토어에서 상태와 액션 가져오기
  const { status: battleStatus, settings: currentSettings } = useBattleStore(state => state);
  const { setBattleState, setParticipants, reset } = useBattleStore(state => state.actions);

  useEffect(() => {
    if (!socket) return;

    // 1. 참가자 명단 업데이트 (입장/퇴장 시)
    const handleParticipantsUpdated = (data: { participants: BattleParticipant[] }) =>
      setParticipants(data.participants);

    // 2. 게임 전체 상태 업데이트 (배틀 상태, 남은 시간, 순위)
    const handleBattleState = (data: {
      status: BattleRoomStatus;
      remainingSeconds: number;
      rankings: Ranking[];
    }) => {
      setBattleState({
        status: data.status,
        remainingSeconds: data.remainingSeconds,
        rankings: data.rankings,
      });
    };

    // 3. 방 설정 변경 브로드캐스트
    const handleRoomUpdated = (data: Partial<BattleRoomSettings>) => {
      if (!currentSettings) return;

      setBattleState({
        settings: {
          ...currentSettings,
          ...data,
        },
      });
    };

    // 4. 게임 종료 및 무효 처리
    const handleBattleFinish = () => setBattleState({ status: 'finished' });
    const handleBattleInvalid = (data: { reason: string }) => {
      setBattleState({ status: 'invalid' });
      console.warn('Game Invalid:', data.reason); //TODO: 이유 UI에 출력
    };

    // 5. 에러 처리
    const handleBattleError = (error: { code: string; message: string }) => {
      if (error.code === 'ROOM_FULL' || error.code === 'ROOM_NOT_JOINABLE') {
        setBattleState({ status: 'invalid' });
      }
    };

    socket.on('battle:participantsUpdated', handleParticipantsUpdated);
    socket.on('battle:state', handleBattleState);
    socket.on('battle:roomUpdated', handleRoomUpdated);
    socket.on('battle:finish', handleBattleFinish);
    socket.on('battle:invalid', handleBattleInvalid);
    socket.on('battle:error', handleBattleError);

    return () => {
      socket.off('battle:participantsUpdated', handleParticipantsUpdated);
      socket.off('battle:state', handleBattleState);
      socket.off('battle:roomUpdated', handleRoomUpdated);
      socket.off('battle:finish', handleBattleFinish);
      socket.off('battle:invalid', handleBattleInvalid);
      socket.off('battle:error', handleBattleError);
    };
  }, [socket, setBattleState, setParticipants]);

  const disconnect = useCallback(() => {
    socketContext.disconnect();
    reset();
  }, [socketContext, reset]);

  return {
    ...socketContext,
    battleStatus, // UI에서 접근하기 편하도록 분리해서 반환
    disconnect,
  };
}
