import { css } from '@emotion/react';
import React from 'react';
import SimpleBar from 'simplebar-react';

import { CtaSection } from './sections/CtaSection';
import { DarkSection } from './sections/DarkSection';
import { HeroSection } from './sections/HeroSection';
import { NeedsSection } from './sections/NeedsSection';
import { PurpleSection } from './sections/PurpleSection';
import { ReviewSection } from './sections/ReviewSection';

import 'simplebar-react/dist/simplebar.min.css';

interface LandingContainerProps {
  onStart: () => void;
  onLogin: () => void;
}

export const LandingContainer = React.memo(({ onStart, onLogin }: LandingContainerProps) => (
  <div css={pageStyle} role="document" aria-label="펀다 랜딩">
    <SimpleBar css={simpleBarStyle} aria-label="랜딩 페이지 스크롤 영역">
      <HeroSection onStart={onStart} onLogin={onLogin} />
      <DarkSection />
      <ReviewSection />
      <PurpleSection />
      <NeedsSection />
      <CtaSection onStart={onStart} />
    </SimpleBar>
  </div>
));

const pageStyle = css`
  height: 100dvh;
  width: 100dvw;
  word-break: keep-all;
`;

const simpleBarStyle = css`
  height: 100dvh;
  width: 100dvw;

  & .simplebar-track,
  .simplebar-scrollbar {
    pointer-events: auto !important;
  }

  & .simplebar-track.simplebar-vertical {
    width: 12px;
    top: 1px;
    bottom: 1px;
    right: 1px;
  }

  & .simplebar-track.simplebar-horizontal {
    height: 12px;
  }

  & .simplebar-visible.simplebar-scrollbar::before {
    opacity: 1;
  }

  & .simplebar-scrollbar::before {
    background-color: #c8c8c8;
  }

  & .simplebar-scrollbar:hover::before {
    background-color: #878787 !important;
  }
`;
