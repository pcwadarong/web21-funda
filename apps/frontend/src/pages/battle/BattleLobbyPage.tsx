import { useEffect } from 'react';

import { BattleLobbyContainer } from '@/feat/battle/components/lobby/BattleLobbyContainer';
import { useBattleSocket } from '@/feat/battle/hooks/useBattleSocket';
import { useCreateBattleRoomMutation } from '@/hooks/queries/battleQueries';

export const BattleLobbyPage = () => {
  const createBattleRoom = useCreateBattleRoomMutation();
  const { battleState, leaveBattle } = useBattleSocket();
  const { roomId } = battleState;

  useEffect(() => {
    if (roomId) {
      leaveBattle(roomId);
    }
  }, [roomId, leaveBattle]);

  const onCreateRoom = () => {
    createBattleRoom.mutate();
  };

  return <BattleLobbyContainer onClick={onCreateRoom} isLoading={createBattleRoom.isPending} />;
};
