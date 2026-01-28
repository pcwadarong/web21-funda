import { useNavigate } from 'react-router-dom';

import { BattleContainer } from '@/features/battle/components/BattleContainer';
import { useCreateBattleRoomMutation } from '@/hooks/queries/battleQueries';
import { useBattleStore } from '@/store/battleStore';

export const Battle = () => {
  const navigate = useNavigate();

  const createBattleRoom = useCreateBattleRoomMutation();

  const { actions } = useBattleStore();

  const onCreateRoom = async () => {
    const data = await createBattleRoom.mutateAsync();

    actions.setBattleState({ roomId: data.roomId, inviteToken: data.inviteToken });

    navigate(`/battle/${data.inviteToken}`);
  };

  return <BattleContainer onClick={onCreateRoom} />;
};
