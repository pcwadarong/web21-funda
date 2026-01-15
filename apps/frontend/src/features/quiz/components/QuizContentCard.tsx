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
}: QuizContentCardProps) => {
  const theme = useTheme();
  const { openModal } = useModal();
  const showResult = status === 'checked';

  return (
    <div css={cardStyle(theme)}>
      <div css={headerStyle}>
        <h2 css={titleStyle(theme)}>{question.content.question}</h2>
        <button
          css={reportButtonStyle(theme)}
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

      <div css={footerStyle}>
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
              {isLast ? '결과 보기' : '다음 문제'}
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
  width: 100%;
  max-width: 45rem;
  background: ${theme.colors.surface.strong};
  padding: 32px;
  border-radius: ${theme.borderRadius.large};
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
`;

const headerStyle = css`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 20px 0;
`;

const titleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Bold'].fontSize};
  line-height: ${theme.typography['20Bold'].lineHeight};
  font-weight: ${theme.typography['20Bold'].fontWeight};
  color: ${theme.colors.text.strong};
  margin: 0;
`;

const footerStyle = css`
  display: flex;
  gap: 12px;
  margin-top: 24px;
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

const reportButtonStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.2rem;
  gap: 0.2rem;
  height: 2.5rem;
  color: ${theme.colors.text.weak};
  background: transparent;
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.xlarge};
  text-wrap: nowrap;
`;
