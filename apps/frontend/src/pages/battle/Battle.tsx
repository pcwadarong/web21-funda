import { BattleContainer } from '@/features/battle/components/BattleContainer';
import { useCreateBattleRoomMutation } from '@/hooks/queries/battleQueries';

export const Battle = () => {
  const createBattleRoom = useCreateBattleRoomMutation();

  const onCreateRoom = () => {
    createBattleRoom.mutate();
  };

  return <BattleContainer onClick={onCreateRoom} isLoading={createBattleRoom.isPending} />;
};
