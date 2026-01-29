import { css } from '@emotion/react';

import { BattleOptionsPanel } from '@/feat/battle/components/setup/BattleOptionsPanel';
import { ParticipantsList } from '@/feat/battle/components/setup/ParticipantsList';

export interface BattleSetupParticipant {
  id: number;
  name: string;
  avatar: string;
  participantId: string;
  profileImageUrl?: string;
}

interface BattleSetupContainerProps {
  participants: BattleSetupParticipant[];
}

export const BattleSetupContainer = ({ participants }: BattleSetupContainerProps) => (
  <div css={containerStyle}>
    <section css={leftSectionStyle}>
      <ParticipantsList participants={participants} />
    </section>
    <section css={rightSectionStyle}>
      <BattleOptionsPanel />
    </section>
  </div>
);

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
