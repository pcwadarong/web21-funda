import { useMutation } from '@tanstack/react-query';

import { battleService } from '@/services/battleService';

/**
 * 배틀 방 생성을 위한 뮤테이션 훅
 */
export const useCreateBattleRoomMutation = () =>
  useMutation({
    mutationFn: () => battleService.createBattleRoom(),
  });

/**
 * 배틀 방 참가 가능 여부 확인을 위한 뮤테이션 훅
 */
export const useJoinBattleRoomMutation = () =>
  useMutation({
    mutationFn: ({ inviteToken }: { inviteToken: string }) =>
      battleService.joinBattleRoom(inviteToken),
  });
