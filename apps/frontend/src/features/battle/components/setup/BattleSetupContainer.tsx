import { css } from '@emotion/react';

import type { BattleRoomSettings, Participant } from '@/feat/battle/types';

import { BattleOptionsPanel } from './BattleOptionsPanel';
import { ParticipantsList } from './ParticipantsList';

export interface BattleSetupContainerProps {
  participants: Participant[];
  /** 현재 사용자 소켓 ID (참여자 카드 하이라이트용) */
  currentParticipantId?: string | null;
  /** 방 설정 패널용 */
  isHost: boolean;
  roomId: string | null;
  settings: BattleRoomSettings | null;
  participantCount: number;
  onUpdateRoom: (roomId: string, settings: BattleRoomSettings) => void;
  onStartBattle: (roomId: string) => void;
  onCopyLink: () => void;
}

export const BattleSetupContainer = ({
  participants,
  currentParticipantId,
  isHost,
  roomId,
  settings,
  participantCount,
  onUpdateRoom,
  onStartBattle,
  onCopyLink,
}: BattleSetupContainerProps) => (
  <div css={mainContainerStyle}>
    <section css={leftSectionStyle}>
      <ParticipantsList participants={participants} currentParticipantId={currentParticipantId} />
    </section>
    <section css={rightSectionStyle}>
      <BattleOptionsPanel
        isHost={isHost}
        roomId={roomId}
        settings={settings}
        participantCount={participantCount}
        onUpdateRoom={onUpdateRoom}
        onStartBattle={onStartBattle}
        onCopyLink={onCopyLink}
      />
    </section>
  </div>
);

const mainContainerStyle = css`
  display: flex;
  width: 100%;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  gap: 40px;
  padding: 30px;
  overflow: hidden;

  @media (max-width: 1200px) {
    flex-direction: column;
    padding: 20px;
    gap: 20px;
  }
`;

const leftSectionStyle = css`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  @media (max-width: 1200px) {
    order: 2;
  }
`;

const rightSectionStyle = css`
  flex: 1.2;
  min-width: 400px;
  display: flex;
  flex-direction: column;

  @media (max-width: 1200px) {
    order: 1;
    flex: 0 1 auto;
    width: 100%;
    min-width: 0;
    margin-bottom: 20px;
  }
`;
