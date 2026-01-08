import { css, useTheme } from '@emotion/react';

import { Button } from '@/comp/Button';
import SVGIcon from '@/comp/SVGIcon';
import { QuizRenderer } from '@/feat/quiz/components/QuizRenderer';
import type { AnswerType, QuestionStatus, QuizQuestion } from '@/feat/quiz/types';
import { useModal } from '@/store/modalStore';
import type { Theme } from '@/styles/theme';

interface QuizContentCardProps {
  question: QuizQuestion;
  status: QuestionStatus;
  selectedAnswer: AnswerType | null;
  onAnswerChange: (answer: any) => void;
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
          onClick={() => openModal('오류 신고', <div>신고 폼</div>)}
        >
          <SVGIcon icon="vector" size="sm" />
          신고
        </button>
      </div>

      <QuizRenderer
        question={question}
        selectedAnswer={selectedAnswer}
        onAnswerChange={onAnswerChange}
        showResult={showResult}
        disabled={status !== 'idle'}
      />

      {showResult && (
        <div css={explanationStyle(theme)}>
          <span style={{ marginRight: '8px' }}>💡</span>
          <span>문제 해설 내용이 여기에 노출됩니다.</span>
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
  font-size: 24px;
  font-weight: 700;
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
const reportButtonStyle = (theme: Theme) => css`
  font-size: 12px;
  width: 72px;
  height: 33px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  background: transparent;
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.xlarge};
  cursor: pointer;
`;
