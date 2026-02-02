import { css, useTheme } from '@emotion/react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ConfirmModal } from '@/comp/ConfirmModal';
import SVGIcon from '@/comp/SVGIcon';
import { useBattleSocket } from '@/features/battle/hooks/useBattleSocket';
import { useCountdownTimer } from '@/hooks/useCountdownTimer';
import type { Theme } from '@/styles/theme';

interface QuizHeaderProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
  heartCount?: number;
  remainingSeconds?: number;
  endsAt?: number;
  isBattleMode?: boolean;
}

export const QuizHeader = ({
  currentStep,
  totalSteps,
  completedSteps,
  heartCount,
  isBattleMode = false,
}: QuizHeaderProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showExitModal, setShowExitModal] = useState(false);

  const { battleState, leaveBattle, disconnect } = useBattleSocket();
  const roomId = isBattleMode ? battleState.roomId : null;
  const remainingSeconds = isBattleMode ? battleState.remainingSeconds : 0;
  const resultEndsAt = isBattleMode ? battleState.resultEndsAt : null;
  const quizEndsAt = isBattleMode ? battleState.quizEndsAt : 0;
  const endsAt = resultEndsAt ?? quizEndsAt;

  const handleCloseClick = useCallback(() => {
    if (isBattleMode) {
      setShowExitModal(true);
    } else {
      if (completedSteps > 0) setShowExitModal(true);
      else navigate('/learn');
    }
  }, [completedSteps, navigate, isBattleMode]);

  const handleContinue = useCallback(() => {
    setShowExitModal(false);
  }, []);

  const handleExit = useCallback(() => {
    if (isBattleMode) {
      if (roomId) {
        leaveBattle(roomId);
        disconnect();
        navigate('/battle');
      }
    } else {
      navigate('/learn');
    }
  }, [navigate, leaveBattle, disconnect, roomId, isBattleMode]);

  const progress = (completedSteps / totalSteps) * 100;
  const displaySeconds = useCountdownTimer({ endsAt, remainingSeconds });

  return (
    <>
      <header css={headerStyle(theme)}>
        <div css={headerContentStyle(heartCount, isBattleMode)}>
          <button css={closeButtonStyle(theme)} onClick={handleCloseClick}>
            ✕
          </button>
          <div css={progressContainerStyle(theme)}>
            <div css={progressBarStyle(theme, progress)} />
          </div>
          <div css={progressTextStyle(theme)}>
            {currentStep}/{totalSteps}
          </div>
        </div>
        {typeof heartCount === 'number' && heartCount > 0 && (
          <div css={heartContainerStyle(theme)}>
            <SVGIcon icon="Heart" size="lg" />
            <span css={heartValueStyle(theme)}>{heartCount}</span>
          </div>
        )}
        {isBattleMode && displaySeconds !== null && (
          <>
            <div css={verticalDividerStyle(theme)}></div>
            <div css={timerStyle(theme, displaySeconds)}>{formatTimer(displaySeconds)}</div>
          </>
        )}
      </header>

      {showExitModal && (
        <ConfirmModal
          isOpen={showExitModal}
          onClose={handleContinue}
          onConfirm={handleExit}
          title={`${isBattleMode ? '배틀' : '학습'} 종료`}
          cancelText={`${isBattleMode ? '배틀 계속하기' : '계속 학습하기'}`}
          confirmText={`${isBattleMode ? '배틀' : '학습'} 종료하기`}
        >
          진행 중인 {isBattleMode ? '배틀' : '학습'}을 종료하시겠습니까?
        </ConfirmModal>
      )}
    </>
  );
};

const headerStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 24px;
  background: ${theme.colors.surface.strong};
  border-bottom: 1px solid ${theme.colors.border.default};
`;

const headerContentStyle = (heartCount?: number, isBattleMode?: boolean) => css`
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: ${isBattleMode ? '42.5rem' : '47.5rem'};
  width: 100%;
  ${heartCount === undefined || heartCount === 0 ? '' : 'margin-left: 80px;'}
`;

const verticalDividerStyle = (theme: Theme) => css`
  width: 1px;
  height: 100%;
  border-left: 1px solid ${theme.colors.border.default};
`;

const closeButtonStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Medium'].fontSize};
  color: ${theme.colors.text.default};
  text-align: center;
`;

const progressContainerStyle = (theme: Theme) => css`
  flex: 1;
  height: 8px;
  background: ${theme.colors.surface.default};
  border-radius: ${theme.borderRadius.small};
  overflow: hidden;
`;

const progressBarStyle = (theme: Theme, progress: number) => css`
  height: 100%;
  width: ${progress}%;
  background: ${theme.colors.primary.main};
  border-radius: ${theme.borderRadius.small};
  transition: width 300ms ease;
`;

const progressTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.default};
  min-width: 48px;
  text-align: center;
`;

const formatTimer = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.max(0, totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const heartContainerStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: ${theme.borderRadius.small};
`;

const heartValueStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Bold'].fontSize};
  font-weight: ${theme.typography['16Bold'].fontWeight};
  color: ${theme.colors.text.default};
`;

const timerStyle = (theme: Theme, seconds: number) => css`
  min-width: 55px;
  font-size: ${theme.typography['24Bold'].fontSize};
  font-weight: ${theme.typography['24Bold'].fontWeight};
  color: ${seconds <= 3 ? theme.colors.error.main : theme.colors.primary.main};
  ${timerJiggleKeyframes};
  ${seconds > 0 && seconds <= 3 ? 'animation: timer-jiggle 0.6s ease-in-out infinite;' : ''}
`;

const timerJiggleKeyframes = css`
  @keyframes timer-jiggle {
    0% {
      transform: translateX(0);
    }
    20% {
      transform: translateX(-2px);
    }
    40% {
      transform: translateX(2px);
    }
    60% {
      transform: translateX(-2px);
    }
    80% {
      transform: translateX(2px);
    }
    100% {
      transform: translateX(0);
    }
  }
`;
