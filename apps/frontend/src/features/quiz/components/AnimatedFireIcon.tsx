import { css } from '@emotion/react';
import { motion, type Variants } from 'framer-motion';

// 1. 파티클 설정 (개수는 줄이고 사이즈와 속도는 다양하게)
const PARTICLE_COUNT = 3;
const particles = Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
  id: i,
  startX: (i - 1) * 30 + (Math.random() * 20 - 10), // 서로 겹치지 않게 간격 배치
  duration: 0.8 + Math.random() * 0.5, // 0.8s ~ 1.3s로 더 빠르게
  size: 6 + i * 4, // 6px, 10px, 14px 형태로 다양하게
  glowSize: 10 + i * 5,
}));

export const AnimatedFireIcon = () => {
  const APPEAR_DELAY = 0.5;

  // 배경 광원 (가장 바깥)
  const backGlowVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: [0, 6.5, 5.5],
      opacity: [0, 1, 0.9],
      transition: {
        delay: APPEAR_DELAY + 0.3,
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  // 중앙 핵심 광원 (작고 강렬함)
  const coreGlowVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: [0, 2.5, 1.2],
      opacity: [0, 0.5, 1],
      transition: {
        delay: APPEAR_DELAY + 0.4,
        duration: 0.5,
        ease: 'backOut',
      },
    },
  };

  // 불꽃 본체 컨테이너
  const containerVariants: Variants = {
    hidden: { scaleY: 1, scaleX: 1 },
    visible: {
      scaleY: [1, 0.4, 1.2, 1],
      scaleX: [1, 1.4, 0.9, 1],
      rotate: [0, -8, 5, 0],
      transition: {
        duration: 0.8,
        delay: APPEAR_DELAY,
        times: [0, 0.3, 0.7, 1],
        ease: 'easeInOut',
      },
    },
    sway: {
      rotate: [-3, 3, -3],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  // 파티클 애니메이션 (이미지 뒤에서 빠르게 분출)
  const sparkVariants: Variants = {
    hidden: { y: 20, opacity: 0, scale: 0 },
    visible: p => ({
      y: -120 - Math.random() * 50, // 더 높이 분출
      x: [p.startX, p.startX + 10, p.startX - 10, p.startX], // 살짝 흔들림
      opacity: [0, 1, 0.5, 0],
      scale: [0.5, 1.2, 0.8, 0],
      transition: {
        duration: p.duration,
        repeat: Infinity,
        delay: APPEAR_DELAY + 0.6 + p.id * 0.15,
        ease: 'easeOut',
      },
    }),
  };

  const outerPathVariants: Variants = {
    hidden: { fill: '#444444' },
    visible: {
      fill: ['#444444', '#ff8957', '#ff8f60'],
      transition: { duration: 0.8, delay: APPEAR_DELAY },
    },
  };

  const innerPathVariants: Variants = {
    hidden: { fill: '#939393', opacity: 0 },
    visible: {
      opacity: 1,
      fill: ['#939393', '#ffc590', '#ffc590'],
      transition: { duration: 0.8, delay: APPEAR_DELAY + 0.1 },
    },
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '150px',
        height: '150px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 1. 배경 대형 광원 */}
      <motion.div
        variants={backGlowVariants}
        initial="hidden"
        animate="visible"
        css={outerHaloStyle}
      />

      {/* 2. 파티클 (z-index: 1 로 설정하여 이미지 뒤로 배치) */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          custom={p}
          variants={sparkVariants}
          initial="hidden"
          animate="visible"
          css={sparkStyle(p.size, p.glowSize)}
        />
      ))}

      {/* 3. 불꽃 본체 및 중앙 광원 */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={['visible', 'sway']}
        style={{
          position: 'relative',
          zIndex: 2, // 파티클보다 앞으로
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transformOrigin: 'bottom center',
        }}
      >
        {/* 중앙 핵심 광원 */}
        <motion.div variants={coreGlowVariants} css={coreGlowStyle} />

        <svg width="150" height="150" viewBox="0 0 23 24" fill="none">
          <motion.path
            d="M18.1704 3.33342C19.6703 4.33344 22.6436 8.90263 21.9146 14.5748C21.2425 19.8031 17.4287 22.6377 15.1703 23.3334C13.5472 23.8334 10.0712 24.7721 5.70821 22.4641C0.254545 19.5792 -0.22018 13.8773 0.062781 12.1762C0.663026 8.56759 2.42658 6.88308 5.47211 1.95059C8.13715 -2.36565 12.1703 1.3334 13.6703 4.83343C14.7656 7.38938 15.6703 7.33343 16.1703 4.83343C16.6703 2.33343 17.7167 3.03093 18.1704 3.33342Z"
            variants={outerPathVariants}
          />
          <motion.path
            d="M6.32504 1.10899C4.9949 -0.619859 3.58518 0.051909 3.04659 0.6039C-0.730262 3.92257 -1.52233 10.4768 3.71247 10.4125C10.256 10.3321 7.98771 3.27006 6.32504 1.10899Z"
            variants={innerPathVariants}
            style={{ transform: 'translate(7px, 12px) scale(0.8)' }}
          />
        </svg>
      </motion.div>
    </div>
  );
};

const outerHaloStyle = css`
  position: absolute;
  width: 40px;
  height: 40px;
  background: radial-gradient(
    circle,
    rgba(255, 111, 63, 0.7) 20%,
    rgba(255, 144, 96, 0.3) 50%,
    transparent 80%
  );
  border-radius: 50%;
  filter: blur(20px);
  mix-blend-mode: screen;
  z-index: 0;
`;

const coreGlowStyle = css`
  position: absolute;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, #ff8e65 10%, #ffba79 50%, transparent 0%);
  border-radius: 50%;
  filter: blur(30px);
  z-index: 3;
  pointer-events: none;
  mix-blend-mode: color-dodge;
  bottom: 0;
`;

const sparkStyle = (size: number, glowSize: number) => css`
  position: absolute;
  width: ${size}px;
  height: ${size}px;
  background: #ffa899;
  border-radius: 50%;
  box-shadow: 0 0 ${glowSize}px #ff9060;
  z-index: 1;
`;
