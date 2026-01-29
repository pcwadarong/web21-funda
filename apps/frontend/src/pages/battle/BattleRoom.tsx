import { css } from '@emotion/react';
import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { GameSettingsPanel } from '@/feat/battle/components/GameSettingsPanel';
import { ParticipantsList } from '@/feat/battle/components/ParticipantsList';
import { useBattleSocket } from '@/feat/battle/hooks/useBattleSocket';
import { useJoinBattleRoomQuery } from '@/hooks/queries/battleQueries';

interface Participant {
  id: number;
  name: string;
  avatar: string;
  participantId: string;
  profileImageUrl?: string;
}

export const BattleRoom = () => {
  const { inviteToken } = useParams<{ inviteToken: string }>();
  const navigate = useNavigate();

  if (!inviteToken) {
    throw new Error('inviteToken is required');
  }

  // 방 참가 가능 여부 확인
  const { data } = useJoinBattleRoomQuery(inviteToken);
  const { battleState, joinBattle, leaveBattle, status: socketStatus, connect } = useBattleSocket();
  const { roomId, status, participants: battleParticipants } = battleState;

  // 소켓 연결 및 방 참여 로직
  useEffect(() => {
    if (!data || !data.canJoin) {
      if (data && !data.canJoin) {
        navigate('/battle');
      }
      return;
    }

    // 소켓 연결 트리거
    if (socketStatus === 'disconnected') {
      connect();
      return;
    }

    // 소켓 연결 완료 후 join
    if (socketStatus === 'connected' && data.roomId) {
      joinBattle(data.roomId, undefined, {
        inviteToken,
        settings: data.settings,
      });
    }
  }, [data, inviteToken, socketStatus, connect, joinBattle, navigate]);
  const unmountedRef = useRef(false);

  useEffect(
    () => () => {
      if (!roomId || unmountedRef.current) {
        return;
      }

      // 게임 진행 중이거나 종료된 상태에서 라우팅으로 언마운트될 때는 방을 떠나지 않는다.
      if (status === 'in_progress' || status === 'finished') {
        return;
      }

      unmountedRef.current = true;
      leaveBattle(roomId);
    },
    [roomId, status, leaveBattle],
  );

  // BattleParticipant → Participant 타입 변환
  const participants: Participant[] = battleParticipants.map(p => ({
    id: p.userId || hashString(p.participantId), // userId 또는 participantId 해시
    name: p.displayName,
    avatar: '🧸', // 기본 아바타
    participantId: p.participantId, // 현재 사용자 구별용
    profileImageUrl: p.avatar, // 로그인 사용자 프로필 이미지
  }));

  return (
    <div css={containerStyle}>
      <section css={leftSectionStyle}>
        <ParticipantsList participants={participants} />
      </section>
      <section css={rightSectionStyle}>
        <GameSettingsPanel />
      </section>
    </div>
  );
};

// 문자열을 숫자로 변환하는 간단한 해시 함수
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

const containerStyle = css`
  display: flex;
  height: 100vh;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  align-items: center;
  gap: 70px;
`;
const leftSectionStyle = css`
  flex: 1;
  overflow-y: auto;
  height: 600px;
  overflow: hidden;
`;

const rightSectionStyle = css`
  flex: 1.2;
  display: flex;
  height: 600px;
  flex-direction: column;
`;
