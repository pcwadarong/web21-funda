import { useSuspenseQuery } from '@tanstack/react-query';

import { battleService } from '@/services/battleService';

export const useJoinBattleRoomQuery = (inviteToken: string) =>
  useSuspenseQuery({
    queryKey: ['battle-room', inviteToken],
    queryFn: () => battleService.joinBattleRoom(inviteToken),
    retry: false,
  });
