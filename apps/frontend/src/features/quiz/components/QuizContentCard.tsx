import { css, useTheme } from '@emotion/react';

import { Button } from '@/comp/Button';
import SVGIcon from '@/comp/SVGIcon';
import { QuizRenderer } from '@/feat/quiz/components/QuizRenderer';
import type {
  AnswerType,
  CorrectAnswerType,
  QuestionStatus,
  QuizQuestion,
} from '@/feat/quiz/types';
import ReportModal from '@/features/report/ReportForm';
import { useModal } from '@/store/modalStore';
import { useThemeStore } from '@/store/themeStore';
import type { Theme } from '@/styles/theme';

interface QuizContentCardProps {
  question: QuizQuestion;
  status: QuestionStatus;
  selectedAnswer: AnswerType | null;
  correctAnswer: CorrectAnswerType | null;
  explanation: string;
  onAnswerChange: (answer: AnswerType) => void;
  isSubmitDisabled: boolean;
  onCheck: () => void;
  onNext: () => void;
  isLast: boolean;
  isReviewMode: boolean;
}

export const QuizContentCard = ({
  question,
  status,
  selectedAnswer,
  onAnswerChange,
  isSubmitDisabled,
  correctAnswer,
  explanation,
  onCheck,
  onNext,
  isLast,
  isReviewMode,
}: QuizContentCardProps) => {
  const theme = useTheme();
  const { isDarkMode } = useThemeStore();
  const { openModal } = useModal();
  const showResult = status === 'checked';
  let nextButtonLabel = '다음 문제';

  if (isLast) {
    if (isReviewMode) {
      nextButtonLabel = '복습 완료';
    } else {
      nextButtonLabel = '결과 보기';
    }
  }

  return (
    <div css={cardStyle(theme)}>
      <div css={headerStyle}>
        <h2 css={titleStyle(theme)}>{`Q. ${question.content.question}`}</h2>
        <button
          css={reportButtonStyle(theme, isDarkMode)}
          onClick={() => openModal('오류 신고', <ReportModal quizId={question.id} />)}
        >
          <SVGIcon icon="Report" size="sm" />
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
        <div css={explanationStyle(theme)}>
          <span style={{ marginRight: '8px' }}>💡</span>
          <span css={explanationTextStyle(theme)}>{explanation}</span>
        </div>
      )}

      <div css={footerStyle(theme)}>
        {showResult ? (
          <>
            <Button
              variant="secondary"
              onClick={() => openModal('해설', <div>상세 해설</div>)}
              css={flexBtn}
            >
              해설 보기
            </Button>
            <Button variant="primary" onClick={onNext} css={flexBtn}>
              {nextButtonLabel}
            </Button>
            <Button
              variant="secondary"
              onClick={() => openModal('AI 질문', <div>AI 답변</div>)}
              css={flexBtn}
            >
              AI 질문
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={onCheck} disabled={isSubmitDisabled} css={flexBtn}>
            {status === 'checking' ? '확인 중..' : '정답 확인'}
          </Button>
        )}
      </div>
    </div>
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
  padding-top: 32px;

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
