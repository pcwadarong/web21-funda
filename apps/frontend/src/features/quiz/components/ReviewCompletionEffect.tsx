import { css } from '@emotion/react';
import { motion, type Variants } from 'framer-motion';

import SVGIcon from '@/comp/SVGIcon';
import type { Theme } from '@/styles/theme';
import { palette } from '@/styles/token';

// 애니메이션 설정 상수
const ANIMATION_DELAY = 0.5; // 메인 배지 등장 시점
const STAR_COUNT = 5;

export const ReviewCompletionEffect = () => {
  // ==========================================
  // 1. 데이터 생성 (파티클 등)
  // ==========================================
  const PASTEL_BLUES = ['#c4ff6c', '#59caff', '#ae7cff', '#6ea3ff'];

  const stars = Array.from({ length: STAR_COUNT }).map((_, i) => ({
    id: i,
    angle: i * (360 / STAR_COUNT) + (Math.random() * 60 - 30),
    distance: 300 + Math.random() * 150,
    size: 15 + Math.random() * 25,
    duration: 1.6 + Math.random() * 0.6,
    color: PASTEL_BLUES[Math.floor(Math.random() * PASTEL_BLUES.length)],
  }));

  // ==========================================
  // 2. Framer Motion Variants
  // ==========================================

  // [배경] 글로우 라인
  const lineVariants: Variants = {
    hidden: { opacity: 0, scaleY: 0, width: '2px', filter: 'blur(2px)' },
    visible: {
      opacity: [0, 1, 1],
      scaleY: [0, 1.2, 1.2],
      width: ['2px', '10px', '90vw'],
      background: 'radial-gradient(circle, #3258ab 0%, #000 75%)',
      filter: ['blur(2px)', 'blur(12px)', 'blur(70px)'],
      transition: { duration: 1, times: [0, 0.3, 1], ease: 'easeInOut' },
    },
    exit: { opacity: 0, transition: { duration: 0.8 } },
  };

  // [배지] 중앙 아이콘 팝업
  const iconVariants: Variants = {
    hidden: { scale: 0, opacity: 0, rotate: -20 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: { type: 'spring', stiffness: 260, damping: 15, delay: ANIMATION_DELAY },
    },
  };

  // [효과] 확산되는 파동 (Shockwave)
  const waveVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: (i: number) => ({
      scale: i === 0 ? 6 : 10,
      opacity: [0, 0.5, 0],
      transition: {
        delay: ANIMATION_DELAY + 0.1 + i * 0.2,
        duration: 1.5,
        ease: [0.2, 0, 0.2, 1],
      },
    }),
  };

  // [효과] 사방으로 퍼지는 별 파티클
  const starVariants: Variants = {
    hidden: { x: 0, y: 0, scale: 0, opacity: 0 },
    visible: (s: (typeof stars)[0]) => ({
      x: Math.cos((s.angle * Math.PI) / 180) * s.distance,
      y: Math.sin((s.angle * Math.PI) / 180) * s.distance,
      scale: [0, 1.2, 0.7, 0],
      opacity: [0, 1, 0.8, 0],
      rotate: [0, 90, 180],
      transition: {
        delay: ANIMATION_DELAY + 0.2,
        duration: s.duration,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  // [텍스트] 타이틀 및 설명문
  const titleVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, delay: ANIMATION_DELAY, ease: 'easeOut' },
    },
  };

  const messageVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay: ANIMATION_DELAY + 0.4, duration: 0.8 },
    },
  };

  return (
    <div css={containerStyle}>
      {/* Layer 0: 배경 라인 */}
      <motion.div
        css={glowLineStyle}
        variants={lineVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      />

      <motion.div css={contentWrapperStyle} initial="hidden" animate="visible" exit="exit">
        {/* Layer 1: 배지 및 시각 효과 그룹 */}
        <div css={badgeAreaStyle}>
          {/* 파동 효과 */}
          <div css={waveLayerStyle}>
            {[0, 1].map(i => (
              <motion.div
                key={i}
                custom={i}
                variants={waveVariants}
                css={i === 1 ? outerWaveStyle : innerWaveStyle}
              />
            ))}
          </div>

          {/* 별 파티클 */}
          {stars.map(s => (
            <motion.div
              key={s.id}
              custom={s}
              variants={starVariants}
              css={particleStyle}
              style={{ color: s.color }}
            >
              <SVGIcon
                icon="RoundStar"
                style={{
                  width: s.size,
                  height: s.size,
                  opacity: 0.7,
                  filter: `drop-shadow(0 0 ${s.size / 3}px ${s.color})`,
                }}
              />
            </motion.div>
          ))}

          {/* 메인 배지 */}
          <motion.div css={badgeStyle} variants={iconVariants}>
            <div css={iconGlowStyle} />
            <SVGIcon icon="Check" size="lg" style={{ width: 48, height: 48, zIndex: 3 }} />
          </motion.div>
        </div>

        {/* Layer 2: 텍스트 정보 그룹 */}
        <div css={textContainerStyle}>
          <motion.h1 css={mainTitleStyle} variants={titleVariants}>
            복습 완료
          </motion.h1>
          <motion.p css={descriptionStyle} variants={messageVariants}>
            훌륭해요! 오늘 배운 내용을 완벽하게 정리했어요.
            <br />
            다음에도 잊지 않게 도와드릴게요.
          </motion.p>
          <motion.p css={captionStyle} variants={messageVariants}>
            XP가 적립되었어요 🎉
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// 3. Emotion Styles
// ==========================================

const containerStyle = css`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  overflow: hidden;
`;

const contentWrapperStyle = css`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

/* 배지 및 효과 정렬 영역 */
const badgeAreaStyle = css`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2.5rem;
`;

const badgeStyle = css`
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #7da6ffa0;
  color: white;
  box-shadow: 0 0 30px rgb(99, 148, 255);
  z-index: 2;
`;

const iconGlowStyle = css`
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, rgba(41, 123, 255, 0.5) 0%, transparent 70%);
  mix-blend-mode: color-dodge;
  z-index: 1;
`;

/* 효과 레이어 (파동, 파티클) */
const waveLayerStyle = css`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  pointer-events: none;
`;

const commonWaveStyle = css`
  position: absolute;
  border-radius: 50%;
`;

const innerWaveStyle = css`
  ${commonWaveStyle};
  width: 100px;
  height: 100px;
  border: 2px solid rgba(154, 104, 255, 0.5);
  filter: blur(1px);
`;

const outerWaveStyle = css`
  ${commonWaveStyle};
  width: 100px;
  height: 100px;
  border: 8px solid rgba(59, 134, 255, 0.38);
  box-shadow: 0 0 30px rgb(120, 110, 255);
`;

const particleStyle = css`
  position: absolute;
  z-index: 5;
  filter: drop-shadow(0 0 8px #637aff);
  pointer-events: none;
`;

/* 배경 요소 */
const glowLineStyle = css`
  position: absolute;
  width: 90vw;
  height: 80vh;
  z-index: 0;
`;

/* 텍스트 스타일 */
const textContainerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const mainTitleStyle = css`
  font-size: 6rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.04em;
  background: linear-gradient(to bottom, #ffffff 40%, #93c5fd 70%, #3b82f6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 25px rgba(153, 192, 255, 0.5));
`;

const descriptionStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Medium'].fontSize};
  font-weight: ${theme.typography['20Medium'].fontWeight};
  line-height: ${theme.typography['20Medium'].lineHeight};
  color: ${palette.grayscale[200]};
`;

const captionStyle = css`
  color: ${palette.grayscale[400]};
`;
