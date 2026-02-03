import { css } from '@emotion/react';
import React from 'react';

import { CtaSection } from './sections/CtaSection';
import { DarkSection } from './sections/DarkSection';
import { HeroSection } from './sections/HeroSection';
import { NeedsSection } from './sections/NeedsSection';
import { PurpleSection } from './sections/PurpleSection';
import { ReviewSection } from './sections/ReviewSection';

interface LandingContainerProps {
  onStart: () => void;
  onLogin: () => void;
}

export const LandingContainer = React.memo(({ onStart, onLogin }: LandingContainerProps) => (
  <div css={pageStyle}>
    <HeroSection onStart={onStart} onLogin={onLogin} />
    <DarkSection />
    <ReviewSection />
    <PurpleSection />
    <NeedsSection />
    <CtaSection onStart={onStart} />
  </div>
));

const pageStyle = css`
  background: #f7f7fc;
  color: #252838;
  min-height: 100vh;
`;
