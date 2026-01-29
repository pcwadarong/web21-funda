import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import type { BattleRoomSettings } from '@/feat/battle/types';
import { battleService } from '@/services/battleService';
import { useBattleStore } from '@/store/battleStore';
import { useToast } from '@/store/toastStore';

/**
 * 배틀 방 참가 가능 여부 확인을 위한 쿼리
 */
export const useJoinBattleRoomQuery = (inviteToken: string) =>
  useSuspenseQuery<{
    roomId: string;
    canJoin: boolean;
    settings: BattleRoomSettings;
  }>({
    queryKey: ['battle-room', inviteToken],
    queryFn: () => battleService.joinBattleRoom(inviteToken),
    retry: false,
  });

/**
 * 배틀 방 생성을 위한 뮤테이션 훅
 */
export const useCreateBattleRoomMutation = () => {
  const navigate = useNavigate();
  const { actions } = useBattleStore();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: () => battleService.createBattleRoom(),
    onSuccess: data => {
      actions.setBattleState({ roomId: data.roomId, inviteToken: data.inviteToken });
      navigate(`/battle/${data.inviteToken}`);
    },
    onError: error => {
      const message = error instanceof Error ? error.message : '방 생성에 실패했습니다.';
      showToast(`방 생성 실패: ${message}`);
      navigate('/battle');
    },
  });
};
