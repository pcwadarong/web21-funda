import { useEffect } from 'react';

import { BattleContainer } from '@/features/battle/components/BattleContainer';
import { useBattleSocket } from '@/features/battle/hooks/useBattleSocket';
import { useCreateBattleRoomMutation } from '@/hooks/queries/battleQueries';

export const Battle = () => {
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

  return <BattleContainer onClick={onCreateRoom} isLoading={createBattleRoom.isPending} />;
};
