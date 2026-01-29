import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useBattleSocket } from '@/feat/battle/hooks/useBattleSocket';
import type { Participant } from '@/feat/battle/types';
import { BattleSetupContainer } from '@/features/battle/components/setup/BattleSetupContainer';
import { useJoinBattleRoomQuery } from '@/hooks/queries/battleQueries';
import { useToast } from '@/store/toastStore';

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
  const { showToast } = useToast();

  if (!inviteToken) {
    throw new Error('inviteToken is required');
  }

  // 방 참가 가능 여부 확인
  const { data } = useJoinBattleRoomQuery(inviteToken);
  const { socket, battleState, joinBattle, leaveBattle, updateRoom, startBattle } =
    useBattleSocket();
  const { roomId, status, participants: battleParticipants, settings } = battleState;

  const isHost = battleParticipants.find(p => p.participantId === socket?.id)?.isHost ?? false;

  useEffect(() => {
    if (!data || !data.canJoin) {
      if (data && !data.canJoin) {
        navigate('/battle');
      }
      return;
    }

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

  const participants: Participant[] = battleParticipants.map(p => ({
    id: p.userId ?? hashString(p.participantId),
    name: p.displayName,
    avatar: '🧸',
    participantId: p.participantId,
    profileImageUrl: p.avatar,
  }));

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('초대 링크가 복사되었습니다. 친구에게 공유해보세요! 🚀');
    } catch {
      showToast('링크 복사에 실패했습니다. 주소창의 링크를 직접 복사해주세요.');
    }
  }, [showToast]);

  return (
    <BattleSetupContainer
      participants={participants}
      currentParticipantId={socket?.id ?? null}
      isHost={isHost}
      roomId={roomId}
      settings={settings}
      onUpdateRoom={updateRoom}
      onStartBattle={startBattle}
      onCopyLink={handleCopyLink}
    />
  );
};
