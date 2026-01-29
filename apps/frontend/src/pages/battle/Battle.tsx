import { useEffect } from 'react';

import { BattleContainer } from '@/features/battle/components/BattleContainer';
import { useCreateBattleRoomMutation } from '@/hooks/queries/battleQueries';
import { useSocketContext } from '@/providers/SocketProvider';
import { useBattleStore } from '@/store/battleStore';

export const Battle = () => {
  const createBattleRoom = useCreateBattleRoomMutation();
  const { socket, emitEvent } = useSocketContext();
  const roomId = useBattleStore(state => state.roomId);
  const resetBattleState = useBattleStore(state => state.actions.reset);

  useEffect(() => {
    if (socket?.connected && roomId) {
      emitEvent('battle:leave', { roomId });
    }
    resetBattleState();
  }, [socket, roomId, emitEvent, resetBattleState]);

  const onCreateRoom = () => {
    createBattleRoom.mutate();
  };

  return <BattleContainer onClick={onCreateRoom} isLoading={createBattleRoom.isPending} />;
};
