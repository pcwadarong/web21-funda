import { css } from '@emotion/react';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { GameSettingsPanel } from '@/feat/battle/components/GameSettingsPanel';
import { ParticipantsList } from '@/feat/battle/components/ParticipantsList';
import { useBattleRoomJoin } from '@/feat/battle/hooks/useBattleRoomJoin';
import { useBattleSocket } from '@/feat/battle/hooks/useBattleSocket';
import { useSocketContext } from '@/providers/SocketProvider';
import { useBattleStore } from '@/store/battleStore';

interface Participant {
  id: number;
  name: string;
  avatar: string;
  participantId: string;
  profileImageUrl?: string;
}

export const BattleRoom = () => {
  const { inviteToken } = useParams<{ inviteToken: string }>();

  if (!inviteToken) {
    throw new Error('inviteToken is required');
  }

  // 소켓 연결 및 방 참여
  useBattleRoomJoin(inviteToken);

  // 소켓 이벤트 리스닝
  useBattleSocket();

  // Cleanup on unmount
  const { leaveRoom } = useSocketContext();
  const roomId = useBattleStore(state => state.roomId);
  const unmountedRef = useRef(false);

  useEffect(
    () => () => {
      if (!roomId || unmountedRef.current) {
        return;
      }

      const currentStatus = useBattleStore.getState().status;
      // 게임 진행 중 라우팅으로 언마운트될 때는 방을 떠나지 않는다.
      if (currentStatus === 'in_progress') {
        return;
      }

      unmountedRef.current = true;
      leaveRoom(roomId);
      useBattleStore.getState().actions.reset();
    },
    [roomId, leaveRoom],
  );

  // battleStore에서 participants 읽기
  const battleParticipants = useBattleStore(state => state.participants);

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
