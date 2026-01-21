import { css } from '@emotion/react';
import { motion, type Variants } from 'framer-motion';

import SVGIcon from '@/comp/SVGIcon';
import { palette } from '@/styles/token';

/**
 * 복습 완료 시 나타나는 축하 화면
 * 결과 수치 없이 시각적 임팩트에 집중한 버전
 */
export const ReviewCompletionEffect = () => {
  const commonExitTransition = { duration: 0.8, ease: 'easeInOut' } as const;

  // 1. 배경 글로우 라인 애니메이션 (Deep Blue & Cyan)
  const lineVariants: Variants = {
    hidden: { opacity: 0, scaleY: 0, width: '2px', filter: 'blur(2px)' },
    visible: {
      opacity: [0, 1, 1],
      scaleY: [0, 1.2, 1.2],
      width: ['2px', '10px', '90vw'],
      background: 'radial-gradient(circle, #1E40AF 0%, #000 75%)',
      filter: ['blur(2px)', 'blur(12px)', 'blur(70px)'],
      transition: { duration: 1, times: [0, 0.3, 1], ease: 'easeInOut' },
    },
    exit: { opacity: 0, transition: commonExitTransition },
  };

  // 2. 메인 아이콘/배지 팝업
  const iconVariants: Variants = {
    hidden: { scale: 0, opacity: 0, rotate: -20 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 15,
        delay: 0.5,
      },
    },
  };

  // 3. 메인 타이틀 (스트릭 숫자처럼 거대한 느낌)
  const titleVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, delay: 0.8, ease: 'easeOut' },
    },
  };

  // 4. 서브 문구 페이드인
  const messageVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay: 1.3, duration: 0.8 },
    },
  };

  return (
    <div css={containerStyle}>
      {/* 배경 광원 라인 */}
      <motion.div
        css={glowLineStyle}
        variants={lineVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      />

      <motion.div css={contentWrapperStyle} initial="hidden" animate="visible" exit="exit">
        {/* 중앙 배지 */}
        <motion.div css={badgeStyle} variants={iconVariants}>
          <div css={iconGlowStyle} />
          <SVGIcon icon="Check" size="lg" style={{ width: 48, height: 48, zIndex: 2 }} />
        </motion.div>

        {/* 메인 텍스트 */}
        <div css={textContainerStyle}>
          <motion.h1 css={mainTitleStyle} variants={titleVariants}>
            복습 완료!
          </motion.h1>

          <motion.p css={descriptionStyle} variants={messageVariants}>
            훌륭해요! 오늘 배운 내용을 완벽하게 정리했어요.
            <br />
            꾸준한 복습이 실력을 만듭니다.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// Emotion Styles
// ==========================================

const containerStyle = css`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  overflow: hidden;
  z-index: 9999;
`;

const glowLineStyle = css`
  position: absolute;
  width: 90vw;
  height: 80vh;
  z-index: 1;
`;

const contentWrapperStyle = css`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const badgeStyle = css`
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 32px;
  color: white;
  margin-bottom: 2.5rem;
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.4);
`;

const iconGlowStyle = css`
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%);
  z-index: 1;
`;

const textContainerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const mainTitleStyle = css`
  font-size: 7.5rem; // 스트릭급 대형 사이즈
  font-weight: 900;
  margin: 0;
  background: linear-gradient(to bottom, #ffffff 40%, #93c5fd 70%, #3b82f6 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 25px rgba(59, 130, 246, 0.5));
  letter-spacing: -0.04em;
  line-height: 1;
`;

const descriptionStyle = css`
  font-size: 20px;
  font-weight: 500;
  color: ${palette.grayscale[400]};
  line-height: 1.6;
  margin: 0;
  max-width: 400px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
`;
