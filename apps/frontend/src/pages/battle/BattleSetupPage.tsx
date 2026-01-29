import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useBattleSocket } from '@/feat/battle/hooks/useBattleSocket';
import {
  BattleSetupContainer,
  type BattleSetupParticipant,
} from '@/features/battle/components/setup/BattleSetupContainer';
import { useJoinBattleRoomQuery } from '@/hooks/queries/battleQueries';

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export const BattleSetupPage = () => {
  const { inviteToken } = useParams<{ inviteToken: string }>();
  const navigate = useNavigate();

  if (!inviteToken) {
    throw new Error('inviteToken is required');
  }

  // 방 참가 가능 여부 확인
  const { data } = useJoinBattleRoomQuery(inviteToken);
  const { battleState, joinBattle, leaveBattle } = useBattleSocket();
  const { roomId, status, participants: battleParticipants } = battleState;

  useEffect(() => {
    if (!data || !data.canJoin) {
      if (data && !data.canJoin) {
        navigate('/battle');
      }
      return;
    }

    // 소켓 연결 및 방 참여 로직

    // 소켓 연결 완료 후 join
    joinBattle(data.roomId, undefined, {
      inviteToken,
      settings: data.settings,
    });
  }, [data, inviteToken, joinBattle, navigate]);

  const unmountedRef = useRef(false);

  useEffect(
    () => () => {
      if (!roomId || unmountedRef.current) return;

      if (status === 'in_progress' || status === 'finished') return;

      unmountedRef.current = true;
      leaveBattle(roomId);
    },
    [roomId, status, leaveBattle],
  );

  const participants: BattleSetupParticipant[] = battleParticipants.map(p => ({
    id: p.userId || hashString(p.participantId),
    name: p.displayName,
    avatar: '🧸',
    participantId: p.participantId,
    profileImageUrl: p.avatar,
  }));

  return <BattleSetupContainer participants={participants} />;
};
