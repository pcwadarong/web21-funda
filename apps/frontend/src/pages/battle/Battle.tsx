import { useNavigate } from 'react-router-dom';

import { BattleContainer } from '@/features/battle/components/BattleContainer';
import { useCreateBattleRoomMutation } from '@/hooks/queries/battleQueries';

export const Battle = () => {
  const navigate = useNavigate();

  const createBattleRoom = useCreateBattleRoomMutation();

  const onCreateRoom = async () => {
    const data = await createBattleRoom.mutateAsync();
    navigate(`/battle/${data.inviteToken}`);
  };

  return <BattleContainer onClick={onCreateRoom} />;
};
