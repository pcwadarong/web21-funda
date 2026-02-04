import { css, useTheme } from '@emotion/react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ConfirmModal } from '@/comp/ConfirmModal';
import SVGIcon from '@/comp/SVGIcon';
import { BattleTimerCountdown } from '@/feat/battle/components/play/BattleTimerCountdown';
import type { QuestionStatus } from '@/feat/quiz/types';
import { useBattleSocket } from '@/features/battle/hooks/useBattleSocket';
import type { Theme } from '@/styles/theme';

interface QuizHeaderProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
  heartCount?: number;
  status?: QuestionStatus;
  isBattleMode?: boolean;
}

export const QuizHeader = ({
  currentStep,
  totalSteps,
  completedSteps,
  heartCount,
  status,
  isBattleMode = false,
}: QuizHeaderProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showExitModal, setShowExitModal] = useState(false);

  const { battleState, leaveBattle, disconnect } = useBattleSocket();
  const roomId = isBattleMode ? battleState.roomId : null;
  const displaySeconds = [<BattleTimerCountdown isResultPhase={true} />];

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

  return (
    <>
      <header css={headerStyle(theme)} aria-label="퀴즈 진행 헤더">
        <div css={headerContentStyle(heartCount, isBattleMode)}>
          <button
            type="button"
            css={closeButtonStyle(theme)}
            onClick={handleCloseClick}
            aria-label={isBattleMode ? '배틀 종료' : '퀴즈 종료'}
          >
            <span aria-hidden="true">✕</span>
          </button>
          <div
            css={progressContainerStyle(theme)}
            role="progressbar"
            aria-valuenow={completedSteps}
            aria-valuemin={0}
            aria-valuemax={totalSteps}
            aria-label={`진행률: ${completedSteps}완료 / ${totalSteps}문제`}
          >
            <div css={progressBarStyle(theme, progress)} aria-hidden="true" />
          </div>
          <div css={progressTextStyle(theme)} aria-hidden="true">
            {currentStep}/{totalSteps}
          </div>
        </div>
        {typeof heartCount === 'number' && heartCount > 0 && (
          <output css={heartContainerStyle(theme)} aria-label={`하트 ${heartCount}개`}>
            <SVGIcon icon="Heart" size="lg" aria-hidden="true" />
            <span css={heartValueStyle(theme)}>{heartCount}</span>
          </output>
        )}
        {isBattleMode && displaySeconds !== null && (
          <>
            <div css={verticalDividerStyle(theme)} aria-hidden="true"></div>
            <BattleTimerCountdown isResultPhase={status === 'checked'} isForHeader={true} />
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
