import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Loading } from '@/components/Loading';
import { useBattleSocket } from '@/feat/battle/hooks/useBattleSocket';
import type { Participant } from '@/feat/battle/types';
import { BattleSetupContainer } from '@/features/battle/components/setup/BattleSetupContainer';
import { useJoinBattleRoomQuery } from '@/hooks/queries/battleQueries';
import { useAuthProfileImageUrl, useAuthUser } from '@/store/authStore';
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
  const location = useLocation();
  const { showToast } = useToast();
  const authUser = useAuthUser();
  const battleProfileImageUrl = useAuthProfileImageUrl() ?? undefined;

  if (!inviteToken) {
    throw new Error('inviteToken is required');
  }

  // 방 참가 가능 여부 확인
  const { data, isLoading, isError, error } = useJoinBattleRoomQuery(inviteToken);
  const { socket, battleState, joinBattle, leaveBattle, updateRoom, startBattle } =
    useBattleSocket();
  const {
    roomId,
    status,
    participants: battleParticipants,
    settings,
    countdownEndsAt,
  } = battleState;

  const isHost = battleParticipants.find(p => p.participantId === socket?.id)?.isHost ?? false;

  useEffect(() => {
    if (!data || !data.canJoin) {
      if (data && !data.canJoin) {
        navigate('/battle');
      }
      return;
    }

    joinBattle(
      data.roomId,
      authUser
        ? {
            userId: authUser.id,
            displayName: authUser.displayName,
            profileImageUrl: battleProfileImageUrl,
          }
        : undefined,
      {
        inviteToken,
        settings: data.settings,
      },
    );
  }, [authUser, battleProfileImageUrl, data, inviteToken, joinBattle, navigate]);

  useEffect(() => {
    if (!isError) {
      return;
    }

    const message = error instanceof Error ? error.message : '방 정보를 불러오지 못했습니다.';
    showToast(message);
    navigate('/battle');
  }, [isError, error, navigate, showToast]);

  const unmountedRef = useRef(false);
  const latestPathRef = useRef(location.pathname);

  useEffect(() => {
    latestPathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(
    () => () => {
      if (!roomId || unmountedRef.current) return;

      if (status === 'countdown' || status === 'in_progress' || status === 'finished') return;

      const nextPath = latestPathRef.current;
      const isBattleFlowPath = nextPath === '/battle' || nextPath.startsWith('/battle/');
      if (isBattleFlowPath) {
        return;
      }

      unmountedRef.current = true;
      leaveBattle(roomId);
    },
    [roomId, status, leaveBattle],
  );

  const participants: Participant[] = battleParticipants.map(p => ({
    id: p.userId ?? hashString(p.participantId),
    name: p.displayName,
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <BattleSetupContainer
      participants={participants}
      currentParticipantId={socket?.id ?? null}
      isHost={isHost}
      roomId={roomId}
      settings={settings}
      participantCount={battleParticipants.length}
      countdownEndsAt={countdownEndsAt}
      onUpdateRoom={updateRoom}
      onStartBattle={startBattle}
      onCopyLink={handleCopyLink}
    />
  );
};
