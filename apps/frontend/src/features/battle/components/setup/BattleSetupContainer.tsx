import { css } from '@emotion/react';

import type { Participant } from '@/feat/battle/types';

import { BattleOptionsPanel } from './BattleOptionsPanel';
import { ParticipantsList } from './ParticipantsList';

interface BattleSetupContainerProps {
  participants: Participant[];
}

export const BattleSetupContainer = ({ participants }: BattleSetupContainerProps) => (
  <div css={mainContainerStyle}>
    <section css={leftSectionStyle}>
      <ParticipantsList participants={participants} />
    </section>
    <section css={rightSectionStyle}>
      <BattleOptionsPanel />
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
    gap: 0;
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
