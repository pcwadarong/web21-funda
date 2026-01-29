import { css } from '@emotion/react';
import React from 'react';

import {
  fadeUp,
  floatBottomBubble,
  floatTopBubble,
  riseActiveStyle,
  riseDelayedStyle,
  riseInitStyle,
  scrollRevealStyle,
  scrollRevealVisibleStyle,
  sectionInnerStyle,
  useScrollReveal,
} from './styles';

export const DarkSection = React.memo(() => {
  const darkReveal = useScrollReveal<HTMLDivElement>();

  return (
    <section css={darkSectionStyle}>
      <div
        ref={darkReveal.ref}
        css={[
          sectionInnerStyle,
          scrollRevealStyle,
          darkReveal.revealed && scrollRevealVisibleStyle,
        ]}
      >
        <div css={darkInnerStyle}>
          <div css={chatRowStyle}>
            <div css={[chatBubbleStyle, chatBubbleStyleTop]}>나는 어떤 CS 지식이 부족한 거지?</div>
            <div css={[chatBubbleStyle, chatBubbleStyleBottom]}>
              어디서부터 어떻게 공부해야 하지?
            </div>
          </div>
          <div css={practiceCardStyle}>
            <div css={practiceGrayGroupStyle}>
              <div css={practiceBottomTextStyle}>
                내가 안다고
                <br />
                착각하는 CS 지식
              </div>
              <div
                css={[practiceGrayPillStyle, riseInitStyle, darkReveal.revealed && riseActiveStyle]}
                aria-hidden="true"
              />
            </div>
            <div css={practicePurpleGroupStyle}>
              <div css={practiceTopTextStyle}>
                실무 면접 및 설계에
                <br />
                필요한 필수 지식
              </div>
              <div
                css={[
                  practicePurplePillStyle,
                  riseInitStyle,
                  darkReveal.revealed && riseDelayedStyle,
                ]}
                aria-hidden="true"
              />
            </div>
          </div>
          <p css={darkCaptionStyle}>
            성장의 본질은 결국 <span style={{ color: '#A29AFF' }}>기초(Fundamentals)</span>의 영구
            기억화입니다.
          </p>
        </div>
      </div>
    </section>
  );
});

const darkSectionStyle = css`
  position: relative;
  padding: 300px 24px 150px;
  background: radial-gradient(circle at center, #4e4b66 0%, #14142b 40%, #14142b 100%);
  color: #fefefe;
  margin-top: -60px;

  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 0;
    right: 0;
    height: 120px;
    background: #eff0f6;
    border-bottom-left-radius: 50% 80%;
    border-bottom-right-radius: 50% 80%;
  }
`;

const darkInnerStyle = css`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
`;

const chatRowStyle = css`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
`;

const chatBubbleStyle = css`
  position: relative;
  padding: 12px 18px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #14142b;
  box-shadow: 0 12px 24px rgba(10, 10, 28, 0.4);

  &::after {
    content: '';
    position: absolute;
    border-width: 8px 8px 0 8px;
    border-style: solid;
    border-color: #b4b5ff8e transparent transparent transparent;
  }
`;

const chatBubbleStyleTop = css`
  background: #d1cef9;
  will-change: transform;
  backface-visibility: hidden;
  transform: translate3d(0, 0, 0);
  animation: ${floatTopBubble} 4s ease-in-out infinite;
  animation-delay: 0.2s;
  z-index: 1;

  &::after {
    left: 15px;
    bottom: -7px;
    border-width: 8px 8px 0 8px;
    border-style: solid;
    border-color: #d1cef9 transparent transparent transparent;
  }
`;

const chatBubbleStyleBottom = css`
  background: #a29aff;
  will-change: transform;
  backface-visibility: hidden;
  transform: translate3d(0, 0, 0);
  animation: ${floatBottomBubble} 4s ease-in-out infinite;
  animation-delay: -0.3s;
  z-index: 0;

  &::after {
    right: 15px;
    bottom: -7px;
    border-width: 8px 8px 0 8px;
    border-style: solid;
    border-color: #a29aff transparent transparent transparent;
  }
`;

const practiceCardStyle = css`
  width: min(480px, 80vw);
  height: min(360px, 60vh);
  background: #fefefe;
  border-radius: 40px;
  padding: 32px 36px;
  color: #14142b;
  box-shadow: 0 28px 50px rgba(6, 6, 20, 0.6);
  animation: ${fadeUp} 650ms ease-out;
  position: relative;
  min-height: 220px;
  overflow: hidden;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const practiceGrayGroupStyle = css`
  position: absolute;
  left: clamp(10px, 12vw, 90px);
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
`;

const practicePurpleGroupStyle = css`
  position: absolute;
  right: clamp(10px, 12vw, 90px);
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
`;

const practiceTopTextStyle = css`
  text-align: center;
  color: #6559ea;
  font-size: 0.75rem;
  font-weight: 500;
`;

const practiceBottomTextStyle = css`
  text-align: center;
  color: #4e4b66;
  font-size: 0.75rem;
  font-weight: 500;
`;

const practiceGrayPillStyle = css`
  --pill-height: 40px;
  width: 120px;
  height: var(--pill-height);
  border-radius: 16px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  background: #d9dbe9;
`;

const practicePurplePillStyle = css`
  --pill-height: clamp(10px, 50vh, 260px);
  width: 120px;
  height: var(--pill-height);
  border-radius: 16px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  background: linear-gradient(180deg, #6559ea 0%, #a29aff 100%);
`;

const darkCaptionStyle = css`
  font-size: 1rem;
  color: rgba(245, 246, 255, 0.7);
`;
