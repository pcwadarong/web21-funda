import { css, useTheme } from '@emotion/react';
import { motion, type Variants } from 'framer-motion';
import { useEffect, useRef } from 'react';

import appearSound from '@/assets/audio/ding.mp3';
import { Button } from '@/comp/Button';
import SVGIcon from '@/comp/SVGIcon';
import { FundyPreviewCanvas } from '@/feat/fundy/components/FundyPreviewCanvas';
import { useSound } from '@/hooks/useSound';
import type { Theme } from '@/styles/theme';

interface QuizResultData {
  xpGained?: number | null;
  experience?: number | null;
  successRate: number | null;
  durationMs?: string;
  durationSeconds?: string;
  currentStreak: number;
  isFirstSolveToday: boolean;
}

const METRIC_CONFIG = (theme: Theme) =>
  [
    {
      key: 'xp',
      title: '획득 XP',
      icon: 'Star' as const,
      getValue: (data: QuizResultData) =>
        data.experience ?? (data.xpGained != null ? data.xpGained : '-'),
      styles: {
        bg: theme.colors.primary.main,
        text: theme.colors.primary.dark,
        iconColor: theme.colors.primary.main,
      },
    },
    {
      key: 'successRate',
      title: '성공률',
      icon: 'Graph' as const,
      getValue: (data: QuizResultData) => (data.successRate != null ? `${data.successRate}%` : '-'),
      styles: {
        bg: theme.colors.success.main,
        text: theme.colors.success.main,
        iconColor: theme.colors.success.main,
      },
    },
    {
      key: 'durationMs',
      title: '소요 시간',
      icon: 'Timer' as const,
      getValue: (data: QuizResultData) => data.durationSeconds ?? data.durationMs ?? '-',
      styles: {
        bg: theme.colors.grayscale[500],
        text: theme.colors.grayscale[500],
        iconColor: theme.colors.grayscale[500],
      },
    },
  ] as const;

// 왼쪽부터 순차 등장과 이후 사운드 타이밍 연동을 위해 애니메이션 값을 상수로 분리한다.
const METRIC_APPEAR_START_X = -18;
const METRIC_APPEAR_INITIAL_SCALE = 0.88;
const METRIC_APPEAR_DURATION_SECONDS = 0.8;
const METRIC_APPEAR_DELAY_SECONDS = 0.35;
const METRIC_APPEAR_PEAK_SCALE = 1.08;
const METRIC_APPEAR_PEAK_TIMING_RATIO = 0.85;
const METRIC_APPEAR_PLAYBACK_RATES = [0.9, 0.95, 1];
const METRIC_APPEAR_SOUND_LEAD_SECONDS = 0.25;

const getMetricAppearVariants = (): Variants => ({
  hidden: {
    opacity: 0,
    x: METRIC_APPEAR_START_X,
    scale: METRIC_APPEAR_INITIAL_SCALE,
  },
  visible: (index: number) => ({
    opacity: [0, 0.3, 1, 1],
    x: [METRIC_APPEAR_START_X, -8, 0],
    scale: [METRIC_APPEAR_INITIAL_SCALE, 0.92, METRIC_APPEAR_PEAK_SCALE, 1],
    transition: {
      duration: METRIC_APPEAR_DURATION_SECONDS,
      delay: index * METRIC_APPEAR_DELAY_SECONDS,
      ease: [0.22, 1, 0.36, 1],
      times: [0, 0.55, 0.85, 1],
    },
  }),
});

interface QuizResultContentProps {
  resultData: QuizResultData;
  onNextNavigation?: () => void;
  onMainNavigation?: () => void;
}

export const QuizResultContent = ({
  resultData,
  onNextNavigation,
  onMainNavigation,
}: QuizResultContentProps) => {
  const theme = useTheme();
  const config = METRIC_CONFIG(theme);
  const metricAppearVariants = getMetricAppearVariants();
  const { playSound, preloadSound, isAudioContextReady } = useSound();
  const hasPlayedAppearSoundRef = useRef(false);
  const appearSoundTimeoutsRef = useRef<number[]>([]);
  const appearSoundSequenceIdRef = useRef(0);
  const isAppearSoundReadyRef = useRef(false);
  const metricCount = config.length;

  const clearAppearSoundTimeouts = () => {
    appearSoundTimeoutsRef.current.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    appearSoundTimeoutsRef.current = [];
  };

  /**
   * 사운드 리소스를 미리 로딩해 재생 지연을 줄인다.
   */
  const ensureAppearSoundReady = async () => {
    if (isAppearSoundReadyRef.current) return true;

    const isReady = await preloadSound(appearSound);
    if (isReady) isAppearSoundReadyRef.current = true;

    return isReady;
  };

  /**
   * 카드가 뿅! 되는 시점에 맞춰 사운드를 순차 재생한다.
   */
  const playAppearSounds = async () => {
    clearAppearSoundTimeouts();
    const sequenceId = appearSoundSequenceIdRef.current + 1;
    appearSoundSequenceIdRef.current = sequenceId;

    // 새로고침 직후처럼 사용자 제스처가 없으면 재생을 예약하지 않는다.
    if (!isAudioContextReady()) return;

    const isReady = await ensureAppearSoundReady();
    if (!isReady) return;
    if (appearSoundSequenceIdRef.current !== sequenceId) return;

    const timeouts = Array.from({ length: metricCount }, (_, index) => {
      const baseDelaySeconds =
        index * METRIC_APPEAR_DELAY_SECONDS +
        METRIC_APPEAR_DURATION_SECONDS * METRIC_APPEAR_PEAK_TIMING_RATIO;
      const delaySeconds = Math.max(0, baseDelaySeconds - METRIC_APPEAR_SOUND_LEAD_SECONDS);
      const playbackRate = METRIC_APPEAR_PLAYBACK_RATES[index] ?? 1;

      return window.setTimeout(() => {
        void playSound({ src: appearSound, volume: 0.6, playbackRate });
      }, delaySeconds * 1000);
    });

    appearSoundTimeoutsRef.current = timeouts;
  };

  useEffect(() => {
    const preloadAppearSound = async () => {
      if (isAppearSoundReadyRef.current) return;

      const isReady = await preloadSound(appearSound);
      if (isReady) isAppearSoundReadyRef.current = true;
    };

    void preloadAppearSound();
  }, [preloadSound]);

  useEffect(() => {
    if (hasPlayedAppearSoundRef.current) return;
    hasPlayedAppearSoundRef.current = true;

    void playAppearSounds();

    return clearAppearSoundTimeouts;
  }, [metricCount, playSound, preloadSound, isAudioContextReady]);

  /* 하나의 값이라도 null인 경우 체크 */
  const hasMissingData = config.some(item => {
    const value = item.getValue(resultData);
    return value === '-' || value === null;
  });

  const handleNextNavigation = () => {
    if (onNextNavigation) onNextNavigation();
  };

  const handleMainNavigation = () => {
    if (onMainNavigation) onMainNavigation();
  };

  return (
    <div css={containerStyle}>
      <h1 css={titleStyle(theme)}>LESSON COMPLETE!</h1>
      <div css={placeholderStyle}>
        <FundyPreviewCanvas
          autoAction="trophy"
          autoHello={false}
          initialAnimation={{ lookAt: true }}
          trophyHold
        />
      </div>

      {!hasMissingData ? (
        <div css={metricsContainerStyle}>
          {config.map((item, index) => (
            <motion.div
              key={item.key}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={metricAppearVariants}
              css={metricCardStyle(theme, item.styles.bg)}
            >
              <div css={metricTitleStyle(theme)}>{item.title}</div>
              <div css={metricValueContainerStyle(theme, item.styles.bg)}>
                <SVGIcon
                  icon={item.icon}
                  size="lg"
                  css={css`
                    color: ${item.styles.iconColor};
                  `}
                />
                <span css={metricValueStyle(theme, item.styles.text)}>
                  {item.getValue(resultData)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p css={noticeTextStyle(theme)}>
          결과 데이터를 불러오지 못했어요. 기록은 정상 저장되었어요.
        </p>
      )}

      <div css={buttonsContainerStyle}>
        <Button variant="primary" onClick={handleNextNavigation} css={fullWidth}>
          학습 계속하기
        </Button>
        <Button variant="secondary" onClick={handleMainNavigation} css={fullWidth}>
          메인 페이지로 이동하기
        </Button>
      </div>
    </div>
  );
};

const containerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  min-height: 100vh;
  padding: 48px 24px;
`;

const titleStyle = (theme: Theme) => css`
  ${theme.typography['32Bold']};
  color: ${theme.colors.primary.main};
  text-align: center;
`;

const placeholderStyle = css`
  width: 100vw;
  height: 400px;
  overflow: hidden;
`;

const metricsContainerStyle = css`
  display: flex;
  gap: 16px;
  width: 100%;
  max-width: 35rem;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const metricCardStyle = (theme: Theme, bgColor: string) => css`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 5px;
  align-items: center;
  justify-content: space-between;
  background: ${bgColor};
  border-radius: ${theme.borderRadius.medium};
`;

const metricTitleStyle = (theme: Theme) => css`
  ${theme.typography['16Medium']};
  color: ${theme.colors.grayscale[50]};
  text-align: center;
  padding: 0.2rem 0 0.4rem;
`;

const metricValueContainerStyle = (theme: Theme, bgColor: string) => css`
  background-color: ${theme.colors.grayscale[50]};
  width: 100%;
  border-radius: ${theme.borderRadius.medium};
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid ${bgColor};
  padding: 2rem 0;
`;

const metricValueStyle = (theme: Theme, textColor: string) => css`
  font-size: ${theme.typography['24Bold'].fontSize};
  line-height: ${theme.typography['24Bold'].lineHeight};
  font-weight: ${theme.typography['24Bold'].fontWeight};
  color: ${textColor};
`;

const noticeTextStyle = (theme: Theme) => css`
  color: ${theme.colors.text.light};
`;

const buttonsContainerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 28px;
  width: 100%;
  max-width: 400px;
`;

const fullWidth = css`
  width: 100%;
`;
