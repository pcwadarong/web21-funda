import { css, keyframes } from '@emotion/react';
import { motion, type Variants } from 'framer-motion';

import type { Theme } from '@/styles/theme';

interface PointEffectProps {
  points: number;
}

export const PointEffect = ({ points }: PointEffectProps) => {
  // Glow 라인 애니메이션 Variants (세로선 -> 가로 확장)
  const lineVariants: Variants = {
    // 초기 상태: 투명함, 세로로 길고 얇은 막대 모양
    hidden: {
      opacity: 0,
      scaleY: 0,
      width: '2px',
      filter: 'blur(2px)',
    },
    // 애니메이션 이후 상태: 세로로 긴 직사각형
    visible: {
      opacity: [0, 1, 1],
      scaleY: [0, 1.2, 1.2], // 가로로 퍼짐
      width: ['2px', '10px', '80vw'], // [시작, 세로완료까지 유지, 가로확장]
      background: 'radial-gradient(#7659EA 0%, #000 70%)', // 방사형 그라디언트
      filter: ['blur(2px)', 'blur(8px)', 'blur(60px)'],
      transition: {
        duration: 0.9,
        times: [0, 0.3, 1], // 각 단계별 시간 비중
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div css={containerStyle}>
      <motion.div css={glowLineStyle} variants={lineVariants} initial="hidden" animate="visible" />
      <div css={starContainerStyle}>
        <span css={starStyle}>🌟</span>
      </div>
      <div css={labelStyle}>POINT</div>
      <div css={pointsStyle}>{points}</div>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 100vh;
  background: #000;
`;

const starContainerStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
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

const labelStyle = (theme: Theme) => css`
  padding: 8px 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.primary.surface};
  letter-spacing: 2px;
`;

const pointsStyle = css`
  font-size: 72px;
  font-weight: 700;
  color: #a29aff;
  text-shadow: 0 0 20px rgba(162, 154, 255, 0.6);
`;
