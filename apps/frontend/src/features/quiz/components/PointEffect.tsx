import { css } from '@emotion/react';
import { motion, type Variants } from 'framer-motion';
import { useEffect } from 'react';

import twinkleSound from '@/assets/audio/twinkle.mp3';
import BigStar from '@/assets/images/star3d.svg?react';
import SVGIcon from '@/comp/SVGIcon';
import { useSound } from '@/hooks/useSound';
import type { Theme } from '@/styles/theme';

interface PointEffectProps {
  points: number;
}

/**
 * 퀴즈 결과 XP 획득 시 나타나는 화려한 포인트 연출 컴포넌트
 * 구조: 배경 라인 확장 -> 별 낙하 및 충격파(Glow) -> 텍스트 순차 등장 -> 소멸(Exit)
 */
export const PointEffect = ({ points }: PointEffectProps) => {
  const { playSound, stopSound } = useSound();

  useEffect(() => {
    void playSound({ src: twinkleSound });
    return () => {
      stopSound(twinkleSound);
    };
  }, [playSound, stopSound]);

  // ==========================================
  // 1. Framer Motion Variants (애니메이션 설정)
  // ==========================================

  // [배경] 세로 실선에서 가로로 넓게 퍼지는 효과
  const lineVariants: Variants = {
    hidden: { opacity: 0, scaleY: 0, width: '2px', filter: 'blur(2px)' },
    visible: {
      opacity: [0, 1, 1],
      scaleY: [0, 1.2, 1.2],
      width: ['2px', '10px', '80vw'],
      background: 'radial-gradient(#7659EA 0%, #000 70%)',
      filter: ['blur(2px)', 'blur(8px)', 'blur(60px)'],
      transition: { duration: 0.9, times: [0, 0.3, 1], ease: 'easeInOut' },
    },
  };

  // [컨테이너] 자식 요소들(별, 텍스트)의 순차 등장 제어
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delayChildren: 0.6, staggerChildren: 0.2 },
    },
  };

  // [별-메인] 위에서 아래로 떨어지며 회전하는 물리 효과
  const starVariants: Variants = {
    hidden: { x: '0', y: '-15vh', rotate: -30, opacity: 0 },
    visible: {
      x: 0,
      y: 0,
      rotate: 0,
      scale: 0.7, // 최종 크기
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 15,
        bounce: 0.6,
        delay: 0.6,
      },
    },
  };

  // [별-SVG] 소멸 시 별 자체가 작아지며 사라지는 효과
  const starSvgVariants: Variants = {
    visible: { opacity: 1 },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.3, ease: [0.32, 0, 0.67, 0] },
    },
  };

  // [중앙 광원] 별 중심에서 터지는 밝은 빛 (Core Glow)
  const centerGlowVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: [0, 4.5, 1.5],
      opacity: [0, 1, 1],
      transition: {
        delay: 0.82,
        duration: 0.45,
        times: [0, 0.2, 1],
        ease: [0.17, 0.67, 0.83, 0.67],
      },
    },
    exit: {
      scale: [1.5, 3, 0],
      opacity: [0.9, 1, 0],
      transition: { duration: 0.6, times: [0, 0.4, 1], ease: 'easeInOut' },
    },
  };

  // [배경 광원] 별 뒤에서 크게 퍼지는 푸른 후광 (Outer Halo)
  const backGlowVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: [0, 4.5, 3.5],
      opacity: [0, 1, 0.6],
      transition: { delay: 0.85, duration: 0.6, times: [0, 0.3, 1], ease: 'easeOut' },
    },
    exit: {
      scale: [3.5, 6, 0],
      opacity: [0.6, 0.8, 0],
      transition: { duration: 0.7, times: [0, 0.5, 1] },
    },
  };

  const STAR_COUNT = 4;
  const DOT_COUNT = 12;

  // [별 파티클-SVG] 8개의 작은 별 파티클이 각기 다른 방향으로 퍼지도록
  const particles = [
    ...Array.from({ length: STAR_COUNT }).map((_, i) => ({
      id: `star-${i}`,
      type: 'star',
      angle: i * 90 + (Math.random() * 40 - 20), // 4방향 + 약간의 랜덤
      distance: Math.random() * 150 + 180,
      size: Math.random() * 50 + 30,
    })),
    ...Array.from({ length: DOT_COUNT }).map((_, i) => ({
      id: `dot-${i}`,
      type: 'dot',
      angle: i * (360 / DOT_COUNT) + (Math.random() * 20 - 10),
      distance: Math.random() * 200 + 120,
      size: Math.random() * 10 + 5,
    })),
  ];

  const particleVariants: Variants = {
    hidden: { x: 0, y: 0, scale: 0, opacity: 0 },
    visible: (custom: { angle: number; distance: number }) => ({
      // 삼각함수를 이용해 각도 방향으로 발사
      x: Math.cos((custom.angle * Math.PI) / 180) * custom.distance,
      y: Math.sin((custom.angle * Math.PI) / 180) * custom.distance,
      scale: [0, 1, 0.5, 0],
      opacity: [0, 1, 1, 0],
      transition: {
        delay: 0.8,
        duration: 1.5,
        times: [0, 0.1, 0.7, 1],
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  // [텍스트] 라벨 및 포인트 숫자의 기본 등장 효과
  const textItemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  // 공통 Exit 설정 (전체 컴포넌트 페이드아웃)
  const commonExitTransition = { duration: 0.8, delay: 0.1 };

  return (
    <div css={containerStyle}>
      {/* 1. 배경 글로우 라인 */}
      <motion.div
        css={glowLineStyle}
        variants={lineVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, transition: commonExitTransition }}
      />

      {/* 2. 콘텐츠 래퍼 (별 + 텍스트) */}
      <motion.div
        css={contentWrapperStyle}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, transition: commonExitTransition }}
      >
        {/* 2-1. 별 섹션 (광원 포함) */}
        <motion.div variants={starVariants} css={starContainerStyle}>
          <motion.div css={outerHaloStyle} variants={backGlowVariants} />
          <motion.div
            css={coreGlowStyle}
            variants={centerGlowVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />
          {/* 파티클 */}
          {particles.map(p => (
            <motion.div
              key={p.id}
              custom={p}
              variants={particleVariants}
              initial="hidden"
              animate="visible"
              css={particleStyle(p.type === 'dot', p.size)}
            >
              {p.type === 'star' ? (
                <SVGIcon
                  icon="RoundStar"
                  style={{
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    display: 'block',
                  }}
                />
              ) : null}
            </motion.div>
          ))}
          {/* 메인 별 이미지 */}
          <motion.div variants={starSvgVariants} exit="exit">
            <BigStar />
          </motion.div>
        </motion.div>

        {/* 2-2. 텍스트 섹션 */}
        <motion.div variants={textItemVariants} css={labelStyle}>
          POINT
        </motion.div>

        <motion.div variants={textItemVariants} css={pointsValueStyle}>
          {points}
        </motion.div>
      </motion.div>
    </div>
  );
};

// ==========================================
// 2. Emotion Styles (스타일 정의)
// ==========================================

const containerStyle = css`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #000;
  overflow: hidden;
`;

const glowLineStyle = css`
  position: absolute;
  width: 80vw;
  height: 90vh;
  z-index: 1;
`;

const contentWrapperStyle = css`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const starContainerStyle = css`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/** 별 뒤쪽에서 퍼지는 푸른색 광원 */
const outerHaloStyle = css`
  position: absolute;
  width: 150px;
  height: 150px;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 1) 0%,
    rgba(100, 180, 255, 0.8) 30%,
    rgba(76, 89, 234, 0.4) 60%,
    rgba(0, 0, 0, 0) 80%
  );
  border-radius: 50%;
  filter: blur(25px);
  mix-blend-mode: screen;
  z-index: 1;
`;

/** 별 중심부에 위치한 아주 밝은 흰색/보라 광원 */
const coreGlowStyle = css`
  position: absolute;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, #e8e4ff 30%, rgba(177, 99, 255, 0.6) 60%, transparent 80%);
  border-radius: 50%;
  filter: blur(10px);
  mix-blend-mode: screen;
  z-index: 3;
  pointer-events: none;
  transform-origin: center center;
`;

const particleStyle = (isDot: boolean, size: number) => css`
  position: absolute;
  z-index: 5;
  color: #e6e4ffff;
  ${isDot &&
  css`
    width: ${size}px;
    height: ${size}px;
    background: radial-gradient(circle, #fff 0%, rgba(177, 99, 255, 0.8) 60%, transparent 100%);
    border-radius: 50%;
    filter: blur(2px);
    box-shadow: 0 0 10px #b163ff;
  `};
`;

const labelStyle = (theme: Theme) => css`
  padding: 0.25rem 1.25rem;
  box-shadow: 0 2px 4px ${theme.colors.primary.light};
  font-size: ${theme.typography['20Bold'].fontSize};
  font-weight: ${theme.typography['20Bold'].fontWeight};
  border-radius: ${theme.borderRadius.large};
  background: #09071087;
  color: ${theme.colors.primary.light};
  letter-spacing: 2px;
`;

const pointsValueStyle = (theme: Theme) => css`
  font-size: 9rem;
  font-weight: 700;
  background: linear-gradient(to bottom, #d4cef9 40%, #897afcff 60%, #9ec3ffff);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 20px ${theme.colors.primary.light});
  display: inline-block;
`;
