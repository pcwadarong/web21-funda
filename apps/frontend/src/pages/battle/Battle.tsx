import { useEffect } from 'react';

import { BattleContainer } from '@/features/battle/components/BattleContainer';
import { useCreateBattleRoomMutation } from '@/hooks/queries/battleQueries';
import { useSocketContext } from '@/providers/SocketProvider';
import { useBattleStore } from '@/store/battleStore';

export const Battle = () => {
  const createBattleRoom = useCreateBattleRoomMutation();
  const { leaveRoom } = useSocketContext();
  const socketRoomId = useSocketContext().roomId;
  const resetBattleState = useBattleStore(state => state.actions.reset);

  useEffect(() => {
    if (socketRoomId) {
      leaveRoom(socketRoomId);
    }
    resetBattleState();
  }, [socketRoomId, leaveRoom, resetBattleState]);

  const onCreateRoom = () => {
    createBattleRoom.mutate();
  };

  return <BattleContainer onClick={onCreateRoom} isLoading={createBattleRoom.isPending} />;
};
