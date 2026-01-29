import { css, keyframes } from '@emotion/react';
import { useEffect, useState } from 'react';

import useIntersectionObserver from '@/hooks/useIntersectionObserver';

export const fadeUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(12px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const floatCard = keyframes`
  0%,
  100% {
    transform: translateY(0) rotate(-6deg);
  }
  50% {
    transform: translateY(-8px) rotate(-6deg);
  }
`;

export const floatTopBubble = keyframes`
  0%,
  100% {
    transform: translate3d(40px, -60px, 0);
  }
  50% {
    transform: translate3d(40px, -64px, 0);
  }
`;

export const floatBottomBubble = keyframes`
  0%,
  100% {
    transform: translate3d(-40px, -25px, 0);
  }
  50% {
    transform: translate3d(-40px, -29px, 0);
  }
`;

export const riseUp = keyframes`
  0% {
    height: 0;
  }
  100% {
    height: var(--pill-height);
  }
`;

export const riseInitStyle = css`
  height: 0;
  overflow: hidden;
  animation: none;

  @media (prefers-reduced-motion: reduce) {
    height: var(--pill-height);
  }
`;

export const riseActiveStyle = css`
  animation: ${riseUp} 600ms ease-out both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const riseDelayedStyle = css`
  animation: ${riseUp} 700ms ease-out both;
  animation-delay: 0.4s;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const scrollRevealStyle = css`
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

export const scrollRevealVisibleStyle = css`
  opacity: 1;
  transform: translateY(0);
`;

export const slideFromRightStyle = css`
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

export const slideFromRightVisibleStyle = css`
  opacity: 1;
  transform: translateX(0);
`;

export const slideDelayStyle = (index: number) => css`
  transition-delay: ${index * 240}ms;
`;

export const sectionInnerStyle = css`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
`;

export const sectionHeaderStyle = css`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 60px;
`;

export const sectionTitleStyle = css`
  margin: 0;
  font-size: clamp(28px, 3.6vw, 2.25rem);
  line-height: clamp(36px, 4vw, 2.75rem);
  font-weight: 700;
  color: #14142b;
`;

export const sectionTitleAccentStyle = css`
  color: #6559ea;
`;

export const sectionSubtitleStyle = css`
  margin: 0;
  font-size: 1rem;
  line-height: 1.5rem;
  color: #6e7191;
`;

const REVEAL_OPTIONS = {
  rootMargin: '0px 0px -20% 0px',
  threshold: 0.2,
};

export const useScrollReveal = <T extends HTMLElement>() => {
  const [ref, isVisible] = useIntersectionObserver<T>(REVEAL_OPTIONS);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setRevealed(true);
    }
  }, [isVisible]);

  return { ref, revealed };
};
