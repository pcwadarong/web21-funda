import { css, useTheme } from '@emotion/react';

import { Button } from '@/comp/Button';
import SVGIcon from '@/comp/SVGIcon';
import { BattleTimerCountdown } from '@/feat/battle/components/play/BattleTimerCountdown';
import { QuizRenderer } from '@/feat/quiz/components/QuizRenderer';
import type {
  AnswerType,
  CorrectAnswerType,
  QuestionStatus,
  QuizQuestion,
} from '@/feat/quiz/types';
import { AiAskModal } from '@/features/ai-ask/components/AiAskModal';
import ReportModal from '@/features/report/ReportForm';
import { useModal } from '@/store/modalStore';
import { useThemeStore } from '@/store/themeStore';
import type { Theme } from '@/styles/theme';
import { TextWithCodeStyle } from '@/utils/textParser';

interface QuizContentCardProps {
  question: QuizQuestion;
  status: QuestionStatus;
  selectedAnswer: AnswerType | null;
  correctAnswer: CorrectAnswerType | null;
  explanation: string;
  onAnswerChange: (answer: AnswerType) => void;
  isSubmitDisabled: boolean;
  isDontKnowDisabled?: boolean;
  onCheck: () => void;
  onDontKnow?: () => void;
  onNext: () => void;
  isLast: boolean;
  isReviewMode: boolean;
  isBattleMode?: boolean;
  remainingSeconds?: number | null;
  endsAt?: number | null;
}

export const QuizContentCard = ({
  question,
  status,
  selectedAnswer,
  onAnswerChange,
  isSubmitDisabled,
  isDontKnowDisabled = false,
  correctAnswer,
  explanation,
  onCheck,
  onDontKnow,
  onNext,
  isLast,
  isReviewMode,
  isBattleMode = false,
}: QuizContentCardProps) => {
  const theme = useTheme();
  const { isDarkMode } = useThemeStore();
  const { openModal } = useModal();
  const showResult = status === 'checked';
  const showDontKnowButton = Boolean(onDontKnow) && !showResult && !isBattleMode && !isReviewMode;
  let nextButtonLabel = '다음 문제';

  if (isLast) {
    if (isReviewMode) {
      nextButtonLabel = '복습 완료';
    } else {
      nextButtonLabel = '결과 보기';
    }
  }

  const battleSubmitButtonLabel = status === 'checking' ? '다른 사람 기다리는 중..' : '제출하기';
  const battleNextButtonLabel = isLast
    ? '자동으로 경기 결과가 나타납니다..'
    : '자동으로 다음 문제로 이동합니다..';
  const battleNextButtonLabelWithTimer = [
    <BattleTimerCountdown isResultPhase={status === 'checked'} />,
    '초 뒤 ',
    battleNextButtonLabel,
  ];

  return (
    <article css={cardStyle(theme)} aria-label="퀴즈 문제">
      <div css={headerStyle}>
        <h2 css={titleStyle(theme)} id="quiz-question-title">
          Q. <TextWithCodeStyle text={question.content.question} />
        </h2>
        <button
          css={reportButtonStyle(theme, isDarkMode)}
          onClick={() => openModal('오류 신고', <ReportModal quizId={question.id} />)}
          aria-label="오류 신고"
        >
          <SVGIcon icon="Report" size="sm" aria-hidden="true" />
          <span>신고</span>
        </button>
      </div>

      <QuizRenderer
        question={question}
        selectedAnswer={selectedAnswer}
        correctAnswer={correctAnswer ?? null}
        onAnswerChange={onAnswerChange}
        showResult={showResult}
        disabled={status !== 'idle'}
      />

      {showResult && explanation && (
        <div css={explanationStyle(theme)} role="region" aria-label="해설">
          <span style={{ marginRight: '8px' }} aria-hidden="true">
            💡
          </span>
          <span css={explanationTextStyle(theme)}>{<TextWithCodeStyle text={explanation} />}</span>
        </div>
      )}

      {showDontKnowButton && (
        <div css={dontKnowWrapperStyle}>
          <button
            type="button"
            css={dontKnowButtonStyle(theme, isDarkMode)}
            onClick={onDontKnow}
            disabled={isDontKnowDisabled}
            aria-label="잘 모르겠어요, 정답 건너뛰기"
          >
            잘 모르겠어요
          </button>
        </div>
      )}

      <div css={footerStyle(theme)} role="group" aria-label="퀴즈 액션">
        {showResult ? (
          <>
            {!isBattleMode && (
              <Button
                variant="secondary"
                onClick={() =>
                  openModal(
                    'AI에게 질문하기',
                    <AiAskModal quiz={question} correctAnswer={correctAnswer ?? null} />,
                    {
                      maxWidth: 880,
                      padding: false,
                    },
                  )
                }
                css={flexBtn}
                aria-label="AI에게 이 문제 질문하기"
              >
                AI 질문
              </Button>
            )}

            <Button
              variant="primary"
              onClick={onNext}
              css={flexBtn}
              disabled={isBattleMode}
              aria-label={isBattleMode ? battleNextButtonLabel : nextButtonLabel}
            >
              {isBattleMode ? battleNextButtonLabelWithTimer : nextButtonLabel}
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            onClick={onCheck}
            disabled={isSubmitDisabled}
            css={flexBtn}
            aria-label={
              isBattleMode
                ? battleSubmitButtonLabel
                : status === 'checking'
                  ? '확인 중'
                  : '정답 확인'
            }
            aria-busy={status === 'checking'}
          >
            {isBattleMode
              ? battleSubmitButtonLabel
              : status === 'checking'
                ? '확인 중..'
                : '정답 확인'}
          </Button>
        )}
      </div>
    </article>
  );
};

const cardStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 48rem;
  min-height: fit-content;
  background: ${theme.colors.surface.strong};
  padding: 32px;
  border-radius: ${theme.borderRadius.large};
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  overflow-y: auto;

  @media (max-width: 768px) {
    border-radius: 0;
    min-height: 100%;
    padding: 24px 20px 140px;
  }
`;

const headerStyle = css`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  fle-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const titleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Bold'].fontSize};
  line-height: ${theme.typography['20Bold'].lineHeight};
  font-weight: ${theme.typography['20Bold'].fontWeight};
  color: ${theme.colors.text.strong};
  word-break: keep-all;
`;

const footerStyle = (theme: Theme) => css`
  display: flex;
  gap: 12px;
  margin-top: auto;
  padding-top: 12px;

  @media (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: ${theme.colors.surface.strong};
    padding: 16px 20px 32px;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
    z-index: 10;
  }
`;

const flexBtn = css`
  flex: 1;
`;

const explanationStyle = (theme: Theme) => css`
  margin-top: 24px;
  padding: 16px;
  background: ${theme.colors.surface.default};
  border-radius: 8px;
`;

const explanationTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.default};
`;

const dontKnowWrapperStyle = css`
  display: flex;
  justify-content: center;
  margin-top: 25px;
`;

const dontKnowButtonStyle = (theme: Theme, isDarkMode: boolean) => css`
  padding: 8px 18px;
  border-radius: ${theme.borderRadius.xlarge};
  border: 1px solid ${isDarkMode ? theme.colors.primary.main : theme.colors.primary.surface};
  background: ${isDarkMode ? theme.colors.surface.strong : theme.colors.grayscale[50]};
  color: ${theme.colors.primary.main};
  font-size: ${theme.typography['14Medium'].fontSize};
  line-height: ${theme.typography['14Medium'].lineHeight};
  font-weight: ${theme.typography['14Medium'].fontWeight};
  cursor: pointer;
  transition:
    filter 150ms ease,
    transform 150ms ease;

  &:not(:disabled):hover {
    filter: brightness(0.98);
  }

  &:not(:disabled):active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const reportButtonStyle = (theme: Theme, isDarkMode: boolean) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.2rem;
  gap: 0.2rem;
  height: 2.5rem;
  color: ${isDarkMode ? theme.colors.text.default : theme.colors.text.weak};
  background: transparent;
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.xlarge};
  text-wrap: nowrap;
  margin-left: 10px;
  width: fit-content;

  @media (max-width: 480px) {
    margin-top: 12px;
    align-self: end;
  }
`;
