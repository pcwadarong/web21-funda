import { useEffect } from 'react';

import { BattleLobbyContainer } from '@/feat/battle/components/lobby/BattleLobbyContainer';
import { useBattleSocket } from '@/feat/battle/hooks/useBattleSocket';
import { useCreateBattleRoomMutation } from '@/hooks/queries/battleQueries';

export const BattleLobbyPage = () => {
  const createBattleRoom = useCreateBattleRoomMutation();
  const { battleState, leaveBattle } = useBattleSocket();
  const { roomId } = battleState;

  useEffect(() => {
    const updateMeta = (selector: string, content: string) => {
      const element = document.querySelector(selector);
      if (element) {
        element.setAttribute('content', content);
      }
    };

    document.title = `퀴즈배틀 | Funda`;
    updateMeta('meta[name="description"]', '다른 사용자와 퀴즈 배틀을 시작하세요!');
    updateMeta('meta[property="og:title"]', `퀴즈배틀 | Funda`);
    updateMeta('meta[property="og:description"]', '다른 사용자와 경쟁하며 보상을 획득하세요');
  }, []);

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
