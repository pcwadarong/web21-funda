import { css } from '@emotion/react';
import React from 'react';

import { Button } from '@/comp/Button';

import { fadeUp, floatCard, sectionInnerStyle } from './styles';

interface HeroSectionProps {
  onStart: () => void;
  onLogin: () => void;
}

export const HeroSection = React.memo(({ onStart, onLogin }: HeroSectionProps) => (
  <section css={heroSectionStyle}>
    <div css={sectionInnerStyle}>
      <div css={heroGridStyle}>
        <div css={heroTextStyle}>
          <h1 css={heroTitleStyle}>지루한 CS 공부, 이제는 플레이하세요.</h1>
          <p css={heroSubtitleStyle}>펀다와 매일 5분, 개발 기초 체력이 잔디처럼 자라납니다.</p>
          <div css={heroButtonRowStyle}>
            <Button variant="primary" onClick={onStart} css={heroPrimaryButtonStyle}>
              사용해 보기
            </Button>
            <Button variant="secondary" onClick={onLogin} css={heroSecondaryButtonStyle}>
              전 이미 계정이 있어요
            </Button>
          </div>
        </div>
        <div css={heroVisualStyle} aria-hidden="true">
          <div css={heroCardShadowStyle} />
          <div css={heroCardMainStyle}>
            <div css={heroCardHeaderStyle}>
              <span css={heroCardTagStyle}>Fundamentals</span>
              <span css={heroCardLevelStyle}>Lv.01</span>
            </div>
            <div css={heroCardBodyStyle}>
              <div css={heroCardMetricStyle}>
                <span>오늘 학습</span>
                <strong>5분</strong>
              </div>
              <div css={heroCardProgressStyle}>
                <span css={heroCardProgressFillStyle} />
              </div>
              <span css={heroCardChipStyle}>매일 짧게, 확실하게</span>
            </div>
          </div>
          <div css={heroCardMiniStyle} />
        </div>
      </div>
    </div>
  </section>
));

const heroSectionStyle = css`
  padding: 200px 24px;
  background:
    radial-gradient(60% 60% at 80% 20%, #b4b5ff8e, transparent 60%),
    linear-gradient(180deg, #f7f7fc 0%, #eff0f6 100%);
  position: relative;
  overflow: hidden;
`;

const heroGridStyle = css`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  align-items: center;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const heroTextStyle = css`
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: ${fadeUp} 600ms ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const heroTitleStyle = css`
  font-size: clamp(32px, 4vw, 2.25rem);
  line-height: clamp(40px, 4.6vw, 2.75rem);
  font-weight: 800;
  color: #14142b;
  margin: 0;
`;

const heroSubtitleStyle = css`
  font-size: 20px;
  line-height: 24px;
  color: #6e7191;
  margin: 0;
`;

const heroButtonRowStyle = css`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 32px;

  @media (max-width: 980px) {
    justify-content: center;
  }
`;

const heroPrimaryButtonStyle = css`
  padding: 14px 24px;
  min-width: 200px;
`;

const heroSecondaryButtonStyle = css`
  padding: 14px 24px;
  min-width: 200px;
`;

const heroVisualStyle = css`
  position: relative;
  height: 320px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 40px 0px;

  @media (max-width: 980px) {
    height: 260px;
  }
`;

const heroCardShadowStyle = css`
  position: absolute;
  width: min(340px, 80vw);
  height: 230px;
  border-radius: 40px;
  background: #d9dbe9;
  top: 14px;
  transform: rotate(-8deg);
  box-shadow: 0 18px 32px rgba(20, 20, 43, 0.24);
  animation: ${floatCard} 4s ease-in-out infinite;
  opacity: 0.85;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const heroCardMainStyle = css`
  position: absolute;
  width: min(300px, 76vw);
  height: 210px;
  border-radius: 24px;
  background: #fefefe;
  border: 1px solid #d9dbe9;
  box-shadow: 0 16px 30px rgba(20, 20, 43, 0.12);
  transform: rotate(-6deg);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const heroCardHeaderStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const heroCardTagStyle = css`
  padding: 4px 10px;
  border-radius: 999px;
  background: #b4b5ff8e;
  color: #6559ea;
  font-size: 0.75rem;
  font-weight: 500;
`;

const heroCardLevelStyle = css`
  font-size: 0.75rem;
  font-weight: 500;
  color: #4e4b66;
`;

const heroCardBodyStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const heroCardMetricStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #252838;

  strong {
    font-size: 1.25rem;
    font-weight: 700;
  }
`;

const heroCardProgressStyle = css`
  width: 100%;
  height: 10px;
  background: #b4b5ff8e;
  border-radius: 999px;
  overflow: hidden;
`;

const heroCardProgressFillStyle = css`
  display: block;
  width: 65%;
  height: 100%;
  background: linear-gradient(90deg, #6559ea 0%, #a29aff 100%);
  border-radius: 999px;
`;

const heroCardChipStyle = css`
  align-self: flex-start;
  padding: 6px 12px;
  border-radius: 999px;
  background: #b4b5ff8e;
  font-size: 0.75rem;
  font-weight: 500;
  color: #4a3fb8;
`;

const heroCardMiniStyle = css`
  position: absolute;
  width: 110px;
  height: 90px;
  border-radius: 24px;
  background: #d9dbe9;
  right: 10%;
  top: 55%;
  transform: rotate(12deg);
  box-shadow: 0 12px 24px rgba(20, 20, 43, 0.2);
`;
