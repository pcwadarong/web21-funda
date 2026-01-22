import { css, keyframes, useTheme } from '@emotion/react';
import React, { useEffect, useState } from 'react';

import GrassImage from '@/assets/landing-icons/grass.png';
import QuizImage from '@/assets/landing-icons/quiz.png';
import RankingImage from '@/assets/landing-icons/ranking.png';
import { Button } from '@/comp/Button';
import SVGIcon from '@/comp/SVGIcon';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import type { Theme } from '@/styles/theme';
import { colors } from '@/styles/token';

interface LandingContainerProps {
  onStart: () => void;
  onLogin: () => void;
}

export const LandingContainer = React.memo(({ onStart, onLogin }: LandingContainerProps) => {
  const theme = useTheme();
  const darkReveal = useScrollReveal<HTMLDivElement>();
  const reviewHeaderReveal = useScrollReveal<HTMLDivElement>();
  const reviewGraphReveal = useScrollReveal<HTMLDivElement>();
  const reviewPillReveal = useScrollReveal<HTMLDivElement>();
  const reviewListReveal = useScrollReveal<HTMLDivElement>();
  const featureCardReveals = [
    useScrollReveal<HTMLDivElement>(),
    useScrollReveal<HTMLDivElement>(),
    useScrollReveal<HTMLDivElement>(),
  ];
  const purpleReveal = useScrollReveal<HTMLDivElement>();
  const needsHeaderReveal = useScrollReveal<HTMLDivElement>();
  const needsItemReveals = [
    useScrollReveal<HTMLLIElement>(),
    useScrollReveal<HTMLLIElement>(),
    useScrollReveal<HTMLLIElement>(),
    useScrollReveal<HTMLLIElement>(),
  ];
  const ctaReveal = useScrollReveal<HTMLDivElement>();
  const reviewScores = [
    { value: 0, emoji: '😭', borderColor: '#FFA2A2', color: '#C10007', backgroundColor: '#FFE2E2' },
    { value: 1, emoji: '😢', borderColor: '#FFB86A', color: '#CA3500', backgroundColor: '#FFEDD4' },
    { value: 2, emoji: '😐', borderColor: '#FFDF20', color: '#A65F00', backgroundColor: '#FEF9C2' },
    { value: 3, emoji: '🙂', borderColor: '#BBF451', color: '#497D00', backgroundColor: '#ECFCCA' },
    { value: 4, emoji: '😊', borderColor: '#7BF1A8', color: '#008236', backgroundColor: '#DCFCE7' },
    {
      value: 5,
      emoji: '😍',
      borderColor: '#6559EA',
      color: '#6559EA',
      backgroundColor: '#6559EA1A',
    },
  ];
  const needsList = [
    'CS 기초가 부족해 기술 면접이 두려운 주니어 개발자',
    '체계적인 로드맵을 따라 학습하고 싶은 초보자',
    '출퇴근 길 5분, 틈틈이 실력을 쌓고 싶은 효율 중시 개발자',
    '지루한 강의보다 인터랙티브한 퀴즈로 체득하고 싶은 분',
  ];
  const featureCards = [
    { title: '가벼운 퀴즈', image: QuizImage, alt: 'quiz example image' },
    { title: '랭킹 1위 달성', image: RankingImage, alt: 'ranking example image' },
    { title: '매일 매일 심는 잔디', image: GrassImage, alt: 'grass example image' },
  ];

  return (
    <div css={pageStyle(theme)}>
      <section css={heroSectionStyle(theme)}>
        <div css={sectionInnerStyle}>
          <div css={heroGridStyle}>
            <div css={heroTextStyle}>
              <h1 css={heroTitleStyle(theme)}>지루한 CS 공부, 이제는 플레이하세요.</h1>
              <p css={heroSubtitleStyle(theme)}>
                펀다와 매일 5분, 개발 기초 체력이 잔디처럼 자라납니다.
              </p>
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
              <div css={heroCardShadowStyle(theme)} />
              <div css={heroCardMainStyle(theme)}>
                <div css={heroCardHeaderStyle}>
                  <span css={heroCardTagStyle(theme)}>Fundamentals</span>
                  <span css={heroCardLevelStyle(theme)}>Lv.01</span>
                </div>
                <div css={heroCardBodyStyle}>
                  <div css={heroCardMetricStyle(theme)}>
                    <span>오늘 학습</span>
                    <strong>5분</strong>
                  </div>
                  <div css={heroCardProgressStyle(theme)}>
                    <span css={heroCardProgressFillStyle(theme)} />
                  </div>
                  <span css={heroCardChipStyle(theme)}>매일 짧게, 확실하게</span>
                </div>
              </div>
              <div css={heroCardMiniStyle(theme)} />
            </div>
          </div>
        </div>
      </section>

      <section css={darkSectionStyle(theme)}>
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
              <div css={[chatBubbleStyle(theme), chatBubbleStyleTop(theme)]}>
                나는 어떤 CS 지식이 부족한 거지?
              </div>
              <div css={[chatBubbleStyle(theme), chatBubbleStyleBottom(theme)]}>
                어디서부터 어떻게 공부해야 하지?
              </div>
            </div>
            <div css={practiceCardStyle(theme)}>
              <div css={practiceGrayGroupStyle}>
                <div css={practiceBottomTextStyle(theme)}>
                  내가 안다고
                  <br />
                  착각하는 CS 지식
                </div>
                <div
                  css={[
                    practiceGrayPillStyle(theme),
                    riseInitStyle,
                    darkReveal.revealed && riseActiveStyle,
                  ]}
                  aria-hidden="true"
                />
              </div>
              <div css={practicePurpleGroupStyle}>
                <div css={practiceTopTextStyle(theme)}>
                  실무 면접 및 설계에
                  <br />
                  필요한 필수 지식
                </div>
                <div
                  css={[
                    practicePurplePillStyle(theme),
                    riseInitStyle,
                    darkReveal.revealed && riseDelayedStyle,
                  ]}
                  aria-hidden="true"
                />
              </div>
            </div>
            <p css={darkCaptionStyle(theme)}>
              성장의 본질은 결국{' '}
              <span style={{ color: theme.colors.primary.light }}>기초(Fundamentals)</span>의 영구
              기억화입니다.
            </p>
          </div>
        </div>
      </section>

      <section css={reviewSectionStyle(theme)}>
        <div css={sectionInnerStyle}>
          <div
            ref={reviewHeaderReveal.ref}
            css={[
              sectionHeaderStyle,
              scrollRevealStyle,
              reviewHeaderReveal.revealed && scrollRevealVisibleStyle,
            ]}
          >
            <h2 css={sectionTitleStyle(theme)}>
              머리가 아닌 입에 붙을 때까지,
              <br />
              <span css={sectionTitleAccentStyle(theme)}>끈질긴 복습 시스템</span>
            </h2>
            <p css={sectionSubtitleStyle(theme)}>
              배운 표현이 영구적으로 기억될 수 있도록,
              <br />
              펀다만의 간격 반복(Spaced Repetition) 알고리즘이 최적의 타이밍을 계산합니다.
            </p>
          </div>

          <div
            ref={reviewGraphReveal.ref}
            css={[
              graphRowStyle,
              scrollRevealStyle,
              reviewGraphReveal.revealed && scrollRevealVisibleStyle,
            ]}
          >
            <div css={graphCardStyle(theme)}>
              <div css={graphHeaderStyle(theme)}>
                <div css={graphTitleStyle(theme)}>
                  <SVGIcon icon="Brain" size="sm" />
                  <span>일반적인 학습</span>
                </div>
                <span css={graphTagStyle(theme)}>급격한 망각</span>
              </div>
              <div css={graphFrameStyle(theme)}>
                <div css={graphInnerFrameStyle}>
                  <SVGIcon icon="GraphDown" css={graphSvgStyle} />
                </div>
                <span css={[graphAxisStyle(theme), graphAxisTopStyle]}>100%</span>
                <span css={[graphAxisStyle(theme), graphAxisBottomStyle]}>0%</span>
                <span css={[graphAxisStyle(theme), graphLabelStyle]}>시간</span>
              </div>
            </div>
            <div css={graphArrowStyle(theme)} aria-hidden="true">
              →
            </div>
            <div css={[graphCardStyle(theme), graphCardActiveStyle(theme)]}>
              <div css={graphHeaderActiveStyle(theme)}>
                <div css={graphTitleActiveStyle(theme)}>
                  <SVGIcon icon="Lightning" size="sm" />
                  <span>Funda 복습 시스템</span>
                </div>
                <span css={[graphTagStyle(theme), graphActiveTagStyle(theme)]}>영구 기억화</span>
              </div>
              <div css={[graphFrameStyle(theme), graphFrameActiveStyle(theme)]}>
                <div css={[graphInnerFrameStyle, graphInnerFrameActiveStyle]}>
                  <SVGIcon icon="GraphUp" css={graphSvgStyle} />
                </div>
                <span
                  css={[graphAxisStyle(theme), graphAxisTopStyle, graphAxisTopActiveStyle(theme)]}
                >
                  100%
                </span>
                <span
                  css={[
                    graphAxisStyle(theme),
                    graphAxisBottomStyle,
                    graphAxisBottomActiveStyle(theme),
                  ]}
                >
                  0%
                </span>
                <span css={[graphAxisStyle(theme), graphLabelStyle, graphLabelActiveStyle(theme)]}>
                  시간
                </span>
                <span css={graphMarkerStyle(theme, '86px', '125px')} />
                <span css={graphMarkerStyle(theme, '150px', '94px')} />
                <span css={graphMarkerStyle(theme, '214px', '60px')} />
                <span css={graphMarkerLabelStyle(theme, '76px', '121px')}>Day 1</span>
                <span css={graphMarkerLabelStyle(theme, '140px', '90px')}>Day 6</span>
                <span css={graphMarkerLabelStyle(theme, '204px', '56px')}>Day 14</span>
              </div>
            </div>
          </div>

          <div
            ref={reviewPillReveal.ref}
            css={[
              reviewPillStyle(theme),
              scrollRevealStyle,
              reviewPillReveal.revealed && scrollRevealVisibleStyle,
            ]}
          >
            지금쯤 이 문제를 복습하기 최적의 타이밍이에요!
          </div>

          <div
            ref={reviewListReveal.ref}
            css={[
              reviewListCardStyle(theme),
              scrollRevealStyle,
              reviewListReveal.revealed && scrollRevealVisibleStyle,
            ]}
          >
            <div css={reviewListHeaderStyle(theme)}>오늘의 복습 리스트</div>
            <div css={reviewListPanelStyle(theme)}>
              <div css={codeBlockStyle(theme)}>
                <code>
                  <span>const result = array.</span>
                  <span>_____(item =&gt; item &gt; 5)</span>
                </code>
              </div>
              <div css={reviewListQuestionStyle(theme)}>빈 칸에 들어갈 배열 메서드는?</div>
            </div>
            <div css={reviewListHintStyle(theme)}>이 개념을 얼마나 잘 기억하고 있나요?</div>
            <div css={reviewScoreRowStyle}>
              {reviewScores.map(score => (
                <div
                  key={score.value}
                  css={reviewScoreItemStyle(
                    theme,
                    score.color,
                    score.borderColor,
                    score.backgroundColor,
                  )}
                >
                  <div css={reviewScoreEmojiStyle}>{score.emoji}</div>
                  <div css={reviewScoreValueStyle(theme)}>{score.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section css={purpleSectionStyle(theme)}>
        <div
          ref={purpleReveal.ref}
          css={[
            sectionInnerStyle,
            scrollRevealStyle,
            purpleReveal.revealed && scrollRevealVisibleStyle,
          ]}
        >
          <div css={sectionHeaderStyle}>
            <h2 css={sectionTitleLightStyle(theme)}>
              언제 어디서나 부담없이
              <br />
              게임처럼 재미있게
            </h2>
          </div>
          <div css={featureCardRowStyle}>
            {featureCards.map((card, index) => (
              <div
                key={card.title}
                ref={featureCardReveals[index]?.ref}
                css={[
                  featureCardStyle(theme),
                  slideFromRightStyle,
                  slideDelayStyle(index),
                  featureCardReveals[index]?.revealed && slideFromRightVisibleStyle,
                ]}
              >
                <div css={featureCardTitleStyle(theme)}>{card.title}</div>
                <div css={featureCardImageStyle}>
                  <img src={card.image} alt={card.alt} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section css={needsSectionStyle(theme)}>
        <div css={sectionInnerStyle}>
          <div
            ref={needsHeaderReveal.ref}
            css={[
              sectionHeaderStyle,
              scrollRevealStyle,
              needsHeaderReveal.revealed && scrollRevealVisibleStyle,
            ]}
          >
            <h2 css={sectionTitleStyle(theme)}>이런 분들께 펀다가 필요합니다</h2>
          </div>
          <ul css={needsListStyle}>
            {needsList.map((item, index) => (
              <li
                key={item}
                ref={needsItemReveals[index]?.ref}
                css={[
                  needsItemStyle(theme),
                  scrollRevealStyle,
                  needsItemReveals[index]?.revealed && scrollRevealVisibleStyle,
                ]}
              >
                <span css={checkBadgeStyle(theme)}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section css={ctaSectionStyle(theme)}>
        <div
          ref={ctaReveal.ref}
          css={[
            sectionInnerStyle,
            scrollRevealStyle,
            ctaReveal.revealed && scrollRevealVisibleStyle,
          ]}
        >
          <div css={ctaInnerStyle}>
            <h2 css={ctaTitleStyle(theme)}>
              지금 바로 시작해보세요.
              <br />첫 번째 퀴즈까지 단 10초면 충분합니다.
            </h2>
            <p css={ctaSubtitleStyle(theme)}>
              로그인 없이도 즉시 도전할 수 있습니다.
              <br />
              펀다의 모든 콘텐츠는 100% 무료로 제공됩니다.
              <br />
              나중에 로그인하면 오늘의 도전 기록을 안전하게 저장해 드릴게요.
            </p>
            <Button variant="secondary" onClick={onStart} css={ctaButtonStyle(theme)}>
              퀴즈 도전하기
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
});

const fadeUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(12px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const floatCard = keyframes`
  0%,
  100% {
    transform: translateY(0) rotate(-6deg);
  }
  50% {
    transform: translateY(-8px) rotate(-6deg);
  }
`;

const floatTopBubble = keyframes`
  0%,
  100% {
    transform: translate3d(40px, -60px, 0);
  }
  50% {
    transform: translate3d(40px, -64px, 0);
  }
`;

const floatBottomBubble = keyframes`
  0%,
  100% {
    transform: translate3d(-40px, -25px, 0);
  }
  50% {
    transform: translate3d(-40px, -29px, 0);
  }
`;

const riseUp = keyframes`
  0% {
    height: 0;
  }
  100% {
    height: var(--pill-height);
  }
`;

const riseInitStyle = css`
  height: 0;
  overflow: hidden;
  animation: none;

  @media (prefers-reduced-motion: reduce) {
    height: var(--pill-height);
  }
`;

const riseActiveStyle = css`
  animation: ${riseUp} 600ms ease-out both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const riseDelayedStyle = css`
  animation: ${riseUp} 700ms ease-out both;
  animation-delay: 0.4s;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const pageStyle = (theme: Theme) => css`
  background: ${theme.colors.surface.default};
  color: ${theme.colors.text.default};
  min-height: 100vh;
`;

const scrollRevealStyle = css`
  opacity: 0;
  transform: translateY(32px);
  transition:
    opacity 600ms ease,
    transform 600ms ease;
  will-change: opacity, transform;

  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
    transform: none;
    transition: none;
  }
`;

const scrollRevealVisibleStyle = css`
  opacity: 1;
  transform: translateY(0);
`;

const slideFromRightStyle = css`
  opacity: 0;
  transform: translateX(48px);
  transition:
    opacity 600ms ease,
    transform 600ms ease;
  will-change: transform, opacity;

  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
    transform: none;
    transition: none;
  }
`;

const slideFromRightVisibleStyle = css`
  opacity: 1;
  transform: translateX(0);
`;

const slideDelayStyle = (index: number) => css`
  transition-delay: ${index * 240}ms;
`;

const sectionInnerStyle = css`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
`;

const heroSectionStyle = (theme: Theme) => css`
  padding: 200px 24px;
  background:
    radial-gradient(60% 60% at 80% 20%, ${theme.colors.primary.surface}, transparent 60%),
    linear-gradient(180deg, ${theme.colors.surface.default} 0%, ${theme.colors.surface.bold} 100%);
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

const heroTitleStyle = (theme: Theme) => css`
  font-size: clamp(32px, 4vw, ${theme.typography['36ExtraBold'].fontSize});
  line-height: clamp(40px, 4.6vw, ${theme.typography['36ExtraBold'].lineHeight});
  font-weight: ${theme.typography['36ExtraBold'].fontWeight};
  color: ${theme.colors.text.strong};
  margin: 0;
`;

const heroSubtitleStyle = (theme: Theme) => css`
  font-size: 20px;
  line-height: 24px;
  color: ${theme.colors.text.weak};
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

const heroCardShadowStyle = (theme: Theme) => css`
  position: absolute;
  width: min(340px, 80vw);
  height: 230px;
  border-radius: ${theme.borderRadius.xlarge};
  background: ${theme.colors.border.default};
  top: 14px;
  transform: rotate(-8deg);
  box-shadow: 0 18px 32px rgba(20, 20, 43, 0.24);
  animation: ${floatCard} 4s ease-in-out infinite;
  opacity: 0.85;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const heroCardMainStyle = (theme: Theme) => css`
  position: absolute;
  width: min(300px, 76vw);
  height: 210px;
  border-radius: ${theme.borderRadius.large};
  background: ${theme.colors.surface.strong};
  border: 1px solid ${theme.colors.border.default};
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

const heroCardTagStyle = (theme: Theme) => css`
  padding: 4px 10px;
  border-radius: 999px;
  background: ${theme.colors.primary.surface};
  color: ${theme.colors.primary.main};
  font-size: ${theme.typography['12Medium'].fontSize};
  font-weight: ${theme.typography['12Medium'].fontWeight};
`;

const heroCardLevelStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  color: ${theme.colors.text.light};
`;

const heroCardBodyStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const heroCardMetricStyle = (theme: Theme) => css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.default};

  strong {
    font-size: ${theme.typography['20Bold'].fontSize};
    font-weight: ${theme.typography['20Bold'].fontWeight};
  }
`;

const heroCardProgressStyle = (theme: Theme) => css`
  width: 100%;
  height: 10px;
  background: ${theme.colors.primary.surface};
  border-radius: 999px;
  overflow: hidden;
`;

const heroCardProgressFillStyle = (theme: Theme) => css`
  display: block;
  width: 65%;
  height: 100%;
  background: linear-gradient(
    90deg,
    ${theme.colors.primary.main} 0%,
    ${theme.colors.primary.light} 100%
  );
  border-radius: 999px;
`;

const heroCardChipStyle = (theme: Theme) => css`
  align-self: flex-start;
  padding: 6px 12px;
  border-radius: 999px;
  background: ${theme.colors.primary.surface};
  font-size: ${theme.typography['12Medium'].fontSize};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  color: ${theme.colors.primary.dark};
`;

const heroCardMiniStyle = (theme: Theme) => css`
  position: absolute;
  width: 110px;
  height: 90px;
  border-radius: ${theme.borderRadius.large};
  background: ${theme.colors.border.default};
  right: 10%;
  top: 55%;
  transform: rotate(12deg);
  box-shadow: 0 12px 24px rgba(20, 20, 43, 0.2);
`;

const darkSectionStyle = (theme: Theme) => css`
  position: relative;
  padding: 300px 24px 150px;
  background: radial-gradient(
    circle at center,
    ${colors.light.grayscale[700]} 0%,
    ${colors.light.grayscale[900]} 40%,
    ${colors.light.grayscale[900]} 100%
  );
  color: ${theme.colors.surface.strong};
  margin-top: -60px;

  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 0;
    right: 0;
    height: 120px;
    background: ${theme.colors.surface.bold};
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

const chatBubbleStyle = (theme: Theme) => css`
  position: relative;
  padding: 12px 18px;
  border-radius: ${theme.borderRadius.medium};
  font-size: ${theme.typography['12Medium'].fontSize};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  color: ${theme.colors.text.strong};
  box-shadow: 0 12px 24px rgba(10, 10, 28, 0.4);

  &::after {
    content: '';
    position: absolute;
    border-width: 8px 8px 0 8px;
    border-style: solid;
    border-color: ${theme.colors.primary.surface} transparent transparent transparent;
  }
`;

const chatBubbleStyleTop = (theme: Theme) => css`
  background: ${theme.colors.primary.semilight};
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
    border-color: ${theme.colors.primary.semilight} transparent transparent transparent;
  }
`;

const chatBubbleStyleBottom = (theme: Theme) => css`
  background: ${theme.colors.primary.light};
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
    border-color: ${theme.colors.primary.light} transparent transparent transparent;
  }
`;

const practiceCardStyle = (theme: Theme) => css`
  width: min(480px, 80vw);
  height: min(360px, 60vh);
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.xlarge};
  padding: 32px 36px;
  color: ${theme.colors.text.strong};
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

const practiceTopTextStyle = (theme: Theme) => css`
  text-align: center;
  color: ${theme.colors.primary.main};
  font-size: ${theme.typography['12Medium'].fontSize};
  font-weight: ${theme.typography['12Medium'].fontWeight};
`;

const practiceBottomTextStyle = (theme: Theme) => css`
  text-align: center;
  color: ${theme.colors.text.light};
  font-size: ${theme.typography['12Medium'].fontSize};
  font-weight: ${theme.typography['12Medium'].fontWeight};
`;

const practiceGrayPillStyle = (theme: Theme) => css`
  --pill-height: 40px;
  width: 120px;
  height: var(--pill-height);
  border-radius: ${theme.borderRadius.medium};
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  background: ${theme.colors.border.default};
`;

const practicePurplePillStyle = (theme: Theme) => css`
  --pill-height: clamp(10px, 50vh, 260px);
  width: 120px;
  height: var(--pill-height);
  border-radius: ${theme.borderRadius.medium};
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  background: linear-gradient(
    180deg,
    ${theme.colors.primary.main} 0%,
    ${theme.colors.primary.light} 100%
  );
`;

const darkCaptionStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  color: rgba(245, 246, 255, 0.7);
`;

const reviewSectionStyle = (theme: Theme) => css`
  padding: 120px 24px;
  background: linear-gradient(
    180deg,
    ${theme.colors.surface.default} 0%,
    ${theme.colors.surface.bold} 100%
  );
`;

const sectionHeaderStyle = css`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 60px;
`;

const sectionTitleStyle = (theme: Theme) => css`
  margin: 0;
  font-size: clamp(28px, 3.6vw, ${theme.typography['36ExtraBold'].fontSize});
  line-height: clamp(36px, 4vw, ${theme.typography['36ExtraBold'].lineHeight});
  font-weight: ${theme.typography['32Bold'].fontWeight};
  color: ${theme.colors.text.strong};
`;

const sectionTitleAccentStyle = (theme: Theme) => css`
  color: ${theme.colors.primary.main};
`;

const sectionSubtitleStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  color: ${theme.colors.text.weak};
`;

const graphRowStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 60px;
`;

const graphTitleStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: ${theme.typography['16Bold'].fontSize};
  color: #6a7282;
`;

const graphCardStyle = (theme: Theme) => css`
  width: min(380px, 90vw);
  background: #f9fafb;
  border-radius: ${theme.borderRadius.large};
  padding: 24px;
  border: 2px solid ${theme.colors.border.default};
  animation: ${fadeUp} 700ms ease-out;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const graphCardActiveStyle = (theme: Theme) => css`
  border-color: ${theme.colors.primary.light};
  background: linear-gradient(135deg, rgba(101, 89, 234, 0.1) 0%, rgba(162, 154, 255, 0.1) 100%);
  box-shadow: 0 12px 24px rgba(20, 20, 43, 0.1);
  color: ${theme.colors.surface.strong};
`;

const graphHeaderStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: ${theme.typography['12Medium'].fontSize};
  font-weight: ${theme.typography['12Medium'].fontWeight};
`;

const graphHeaderActiveStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${theme.colors.surface.strong};
`;

const graphTitleActiveStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: ${theme.typography['16Bold'].fontSize};
  color: ${theme.colors.primary.main};
`;

const graphTagStyle = (theme: Theme) => css`
  padding: 4px 10px;
  border-radius: 999px;
  background: ${theme.colors.surface.strong};
  border: 1px solid #e5e7eb;
  color: #6a7282;
  font-size: ${theme.typography['12Medium'].fontSize};
`;

const graphActiveTagStyle = (theme: Theme) => css`
  color: ${theme.colors.primary.main};
  border-color: ${theme.colors.primary.main};
`;

const graphFrameStyle = (theme: Theme) => css`
  position: relative;
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.large};
  padding: 36px 42px;
  border: 1px solid #e5e7eb;
`;

const graphInnerFrameStyle = css`
  height: 145px;
  padding-top: 15px;
  border-left: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
`;

const graphInnerFrameActiveStyle = css`
  padding-top: 0;
  padding-bottom: 15px;
`;

const graphFrameActiveStyle = (theme: Theme) => css`
  background: ${theme.colors.surface.strong};
  border: 1px solid rgba(255, 255, 255, 0.7);
  width: 100%;
  border: 1px solid #e5e7eb;
`;

const graphSvgStyle = css`
  width: 100% !important;
  height: 100% !important;
  display: block;
`;

const graphAxisStyle = (theme: Theme) => css`
  position: absolute;
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
`;

const graphAxisTopStyle = css`
  left: 48px;
  top: 32px;
`;

const graphAxisBottomStyle = css`
  left: 50px;
  bottom: 40px;
`;

const graphLabelStyle = css`
  right: 40px;
  bottom: 14px;
`;

const graphAxisTopActiveStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.primary.main};
`;

const graphAxisBottomActiveStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.primary.main};
`;

const graphLabelActiveStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.primary.main};
`;

const graphMarkerStyle = (theme: Theme, left: string, top: string) => css`
  position: absolute;
  left: ${left};
  top: ${top};
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #23c55e;
  border: 2px solid ${theme.colors.surface.strong};
`;

const graphMarkerLabelStyle = (theme: Theme, left: string, top: string) => css`
  position: absolute;
  left: ${left};
  top: ${top};
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.primary.main};
  transform: translateY(-14px);
`;

const graphArrowStyle = (theme: Theme) => css`
  font-size: ${theme.typography['24Bold'].fontSize};
  color: ${theme.colors.primary.main};
  padding: 4px 10px;
`;

const reviewPillStyle = (theme: Theme) => css`
  margin: 28px auto 32px;
  width: fit-content;
  padding: 12px 60px;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.primary.semilight};
  color: ${theme.colors.primary.dark};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  font-size: ${theme.typography['12Medium'].fontSize};
  position: relative;
  box-shadow: 0 12px 24px rgba(20, 20, 43, 0.1);
  text-align: center;

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -8px;
    border-width: 8px 8px 0 8px;
    border-style: solid;
    border-color: ${theme.colors.primary.semilight} transparent transparent transparent;
    box-shadow: 0 12px 24px rgba(20, 20, 43, 0.1);
  }
`;

const reviewListCardStyle = (theme: Theme) => css`
  max-width: 540px;
  margin: 0 auto;
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.large};
  padding: 24px;
  border: 1px solid ${theme.colors.border.default};
  box-shadow: 0 14px 30px rgba(20, 20, 43, 0.12);
  text-align: center;
  animation: ${fadeUp} 650ms ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const reviewListHeaderStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Bold'].fontSize};
  font-weight: ${theme.typography['16Bold'].fontWeight};
  color: ${theme.colors.primary.main};
  margin-bottom: 24px;
`;

const reviewListPanelStyle = (theme: Theme) => css`
  background: ${theme.colors.surface.default};
  border-radius: ${theme.borderRadius.large};
  border: 1px solid ${theme.colors.border.default};
  padding: 16px;
  margin-bottom: 24px;
`;

const codeBlockStyle = (theme: Theme) => css`
  background: ${colors.light.grayscale[900]};
  color: ${colors.light.grayscale[50]};
  border-radius: ${theme.borderRadius.medium};
  padding: 18px 16px;
  font-family: 'D2Coding', monospace;
  font-size: ${theme.typography['12Medium'].fontSize};
  margin-bottom: 12px;
  text-align: left;

  code {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  code > span:nth-child(1) {
    color: #05df72;
  }

  code > span:nth-child(2) {
    color: #ffdf20;
  }
`;

const reviewListQuestionStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.light};
  text-align: left;
`;

const reviewListHintStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
  margin-bottom: 16px;
  text-align: center;
`;

const reviewScoreRowStyle = css`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 540px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const reviewScoreItemStyle = (
  theme: Theme,
  color: string,
  borderColor: string,
  backgroundColor: string,
) => css`
  height: 80px;
  color: ${color};
  background-color: ${backgroundColor};
  border-radius: ${theme.borderRadius.medium};
  border: 2px solid ${borderColor};
  padding: 10px 6px;
  text-align: center;
  box-shadow: 0 10px 18px rgba(20, 20, 43, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const reviewScoreEmojiStyle = css`
  font-size: 18px;
  line-height: 1.2;
`;

const reviewScoreValueStyle = (theme: Theme) => css`
  margin-top: 6px;
  font-size: ${theme.typography['12Medium'].fontSize};
  font-weight: ${theme.typography['12Medium'].fontWeight};
`;

const purpleSectionStyle = (theme: Theme) => css`
  padding: 110px 24px 130px;
  background: linear-gradient(
    180deg,
    ${theme.colors.primary.main} 0%,
    ${theme.colors.primary.main} 80%,
    ${theme.colors.surface.bold} 100%
  );
  color: ${theme.colors.surface.strong};
`;

const sectionTitleLightStyle = (theme: Theme) => css`
  margin: 0;
  font-size: clamp(24px, 3.2vw, ${theme.typography['32Bold'].fontSize});
  font-weight: ${theme.typography['32Bold'].fontWeight};
`;

const featureCardRowStyle = css`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const featureCardStyle = (theme: Theme) => css`
  height: 310px;
  background: ${theme.colors.surface.default};
  border-radius: ${theme.borderRadius.medium};
  padding: 18px;
  box-shadow: 0 16px 26px rgba(21, 21, 47, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-height: 180px;
`;

const featureCardTitleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Bold'].fontSize};
  color: #4a5565;
`;

const featureCardImageStyle = css`
  height: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const needsSectionStyle = (theme: Theme) => css`
  padding: 110px 24px;
  background: ${theme.colors.surface.bold};
`;

const needsListStyle = css`
  width: min(450px, 80vw);
  display: grid;
  gap: 16px;
  margin: 0;
  padding: 0;
  max-width: 720px;
  margin-inline: auto;
`;

const needsItemStyle = (theme: Theme) => css`
  list-style: none;
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.medium};
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 20px rgba(20, 20, 43, 0.1);
  font-size: ${theme.typography['16Medium'].fontSize};
  color: ${theme.colors.text.strong};
`;

const checkBadgeStyle = (theme: Theme) => css`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${theme.colors.primary.light};
  color: ${theme.colors.surface.strong};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography['12Medium'].fontSize};
  font-weight: ${theme.typography['12Medium'].fontWeight};
`;

const ctaSectionStyle = (theme: Theme) => css`
  padding: 120px 24px 140px;
  background: linear-gradient(
    180deg,
    ${theme.colors.primary.main} 0%,
    ${theme.colors.primary.dark} 100%
  );
  color: ${theme.colors.surface.strong};
`;

const ctaInnerStyle = css`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
`;

const REVEAL_OPTIONS = {
  rootMargin: '0px 0px -20% 0px',
  threshold: 0.2,
};

const useScrollReveal = <T extends HTMLElement>() => {
  const [ref, isVisible] = useIntersectionObserver<T>(REVEAL_OPTIONS);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setRevealed(true);
    }
  }, [isVisible]);

  return { ref, revealed };
};

const ctaTitleStyle = (theme: Theme) => css`
  margin: 0;
  font-size: clamp(24px, 4vw, ${theme.typography['36ExtraBold'].fontSize});
  font-weight: ${theme.typography['32Medium'].fontWeight};
`;

const ctaSubtitleStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  color: rgba(245, 246, 255, 0.8);
`;

const ctaButtonStyle = (theme: Theme) => css`
  margin-top: 18px;
  min-width: 180px;
  background: ${theme.colors.surface.strong};
  color: ${theme.colors.primary.dark};
`;
