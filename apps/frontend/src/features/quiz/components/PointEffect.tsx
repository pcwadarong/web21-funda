import { css, keyframes } from '@emotion/react';
import { motion, type Variants } from 'framer-motion';

import type { Theme } from '@/styles/theme';

interface PointEffectProps {
  points: number;
}

export const PointEffect = ({ points }: PointEffectProps) => {
  // Glow 라인 애니메이션 Variants (세로선 -> 가로 확장)
  const lineVariants: Variants = {
    hidden: {
      opacity: 0,
      scaleY: 0,
      width: '2px',
      filter: 'blur(2px)',
    },
    visible: {
      opacity: [0, 1, 1],
      scaleY: [0, 1.2, 1.2],
      width: ['2px', '10px', '80vw'], // [시작, 세로완료까지 유지, 가로확장]
      background: 'radial-gradient(#7659EA 0%, #000 70%)',
      filter: ['blur(2px)', 'blur(8px)', 'blur(60px)'],
      transition: {
        duration: 0.9,
        times: [0, 0.3, 1], // 각 단계별 시간 비중
        ease: 'easeInOut',
      },
    },
  };

  // 콘텐츠 순차 등장 Variants

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.6, // 라인이 가로로 퍼질 때쯤 시작
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div css={containerStyle}>
      <motion.div css={glowLineStyle} variants={lineVariants} initial="hidden" animate="visible" />
      <motion.div
        css={contentWrapperStyle}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} css={starContainerStyle}>
          <span css={starStyle}>🌟</span>
        </motion.div>

        <motion.div variants={itemVariants} css={labelStyle}>
          POINT
        </motion.div>

        <motion.div variants={itemVariants} css={pointsStyle}>
          {points}
        </motion.div>
      </motion.div>
    </div>
  );
};

const starShineAnimation = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
  }
  25% {
    filter: drop-shadow(0 0 20px rgba(255, 215, 0, 1));
  }
  50% {
    filter: drop-shadow(0 0 30px rgba(255, 215, 0, 1));
  }
  75% {
    filter: drop-shadow(0 0 20px rgba(255, 215, 0, 1));
  }
`;

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

const starStyle = css`
  font-size: 120px;
  animation: ${starShineAnimation} 1s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
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
  margin-bottom: 20px;
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

const pointsStyle = (theme: Theme) => css`
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
