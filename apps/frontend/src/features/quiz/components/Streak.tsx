import { css } from '@emotion/react';
import { motion, type Variants } from 'framer-motion';
import { useEffect } from 'react';

import fireSound from '@/assets/audio/fire.mp3';
import SVGIcon from '@/comp/SVGIcon';
import { getSortedWeekdays } from '@/feat/quiz/utils/getSortedWeekDays';
import { useSound } from '@/hooks/useSound';
import type { Theme } from '@/styles/theme';
import { palette } from '@/styles/token';

import { AnimatedFireIcon } from './AnimatedFireIcon';

interface StreakProps {
  currentStreak?: number;
}

export const Streak = ({ currentStreak = 1 }: StreakProps) => {
  const { playSound, stopSound } = useSound();

  useEffect(() => {
    void playSound({ src: fireSound });
    return () => {
      stopSound(fireSound);
    };
  }, []);

  // 요일 정렬
  const allDays = getSortedWeekdays(currentStreak);

  // 체크 표시를 할 개수
  const completedCount = currentStreak <= 7 ? currentStreak : 7;

  // 공통 Exit 설정 (디졸브 효과의 핵심)
  const commonExitTransition = { duration: 0.8, ease: 'easeInOut' } as const;

  // ---------------------------------------------------------
  // Framer Motion Variants (애니메이션 설정)
  // ---------------------------------------------------------
  // 배경 글로우 라인 애니메이션
  const lineVariants: Variants = {
    hidden: { opacity: 0, scaleY: 0, width: '2px', filter: 'blur(2px)' },
    visible: {
      opacity: [0, 1, 1],
      scaleY: [0, 1.2, 1.2],
      width: ['2px', '10px', '80vw'],
      background: 'radial-gradient(#5A2C25 0%, #000 70%)',
      filter: ['blur(2px)', 'blur(8px)', 'blur(60px)'],
      transition: { duration: 0.9, times: [0, 0.3, 1], ease: 'easeInOut' },
    },
    exit: { opacity: 0, transition: commonExitTransition },
  };

  // 전체 콘텐츠를 감싸는 Variant
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0, transition: commonExitTransition },
  };

  // 메인 숫자(스트릭) 등장 애니메이션
  const streakVariants: Variants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: [0.9, 1.2, 1],
      transition: { duration: 0.6, delay: 0.8, ease: 'easeOut' },
    },
  };

  // 하단 서브텍스트 등장 애니메이션
  const subtextVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 1.1, duration: 0.5 },
    },
  };

  return (
    <div css={containerStyle}>
      {/* 1. 배경 글로우 라인 - 소멸 시 opacity 0 처리 */}
      <motion.div
        css={glowLineStyle}
        variants={lineVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      />

      {/* 2. 전체 콘텐츠 래퍼 - AnimatePresence와 연동되어 디졸브(Fade out) 효과 발생 */}
      <motion.div
        css={contentWrapperStyle}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <AnimatedFireIcon />

        <h1 css={titleWrapperStyle}>
          <motion.p
            css={currentStreakStyle}
            variants={streakVariants}
            initial="hidden"
            animate="visible"
            style={{ transformOrigin: 'bottom center' }}
          >
            {currentStreak}
          </motion.p>
          <motion.p
            css={titleSubtextStyle}
            variants={subtextVariants}
            initial="hidden"
            animate="visible"
          >
            연속 학습!
          </motion.p>
        </h1>

        <div css={daysContainerWrapperStyle}>
          <div css={daysContainerStyle}>
            {allDays.map((day, index) => {
              const isCompleted = index < completedCount;
              return (
                <div key={`${day}-${index}`} css={dayContainerStyle}>
                  <span css={dayLabelStyle}>{day}</span>
                  <div css={dayCircleStyle(isCompleted)}>
                    {isCompleted && <SVGIcon icon="Check" aria-hidden="true" size="md" />}
                  </div>
                </div>
              );
            })}
          </div>

          <p css={encouragementStyle}>
            하루 학습을 빠지면 연속 학습 기록이 초기화 돼요.
            <br />
            계속 학습해서 {currentStreak + 1}일차로 이어가세요!
          </p>
        </div>
      </motion.div>
    </div>
  );
};

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
`;

const titleWrapperStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
`;

const currentStreakStyle = css`
  font-size: 9rem;
  font-weight: 700;
  background: linear-gradient(to bottom, #f9e0ce 40%, rgb(252, 154, 122) 70%, rgb(164, 255, 192));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 20px #ffa35d);
  display: inline-block;
`;

const titleSubtextStyle = css`
  font-size: 40px;
  font-weight: 500;
  line-height: 0;
  margin: 0.5rem 0 2rem;
  color: ${palette.grayscale[300]};
`;

const daysContainerWrapperStyle = (theme: Theme) => css`
  padding: 0.5rem 1rem;
  background: #00000043;
  border-radius: ${theme.borderRadius.large};
`;

const daysContainerStyle = css`
  display: flex;
  gap: 20px;
  margin: 16px 0 0 0;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const dayContainerStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: ${theme.typography['16Bold'].fontSize};
  line-height: ${theme.typography['16Bold'].lineHeight};
  font-weight: ${theme.typography['16Bold'].fontWeight};
`;

const dayCircleStyle = (isCompleted: boolean) => css`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: ${isCompleted ? '#FFA35D' : '#00000066'};
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: ${isCompleted ? '0 0 12px rgba(255, 163, 93, 0.5)' : 'none'};
`;

const dayLabelStyle = css`
  color: #8e8e8e;
`;

const encouragementStyle = css`
  color: ${palette.grayscale[300]};
  text-align: center;
  border-top: 1px solid ${palette.grayscale[700]};
  padding-top: 1rem;
`;
