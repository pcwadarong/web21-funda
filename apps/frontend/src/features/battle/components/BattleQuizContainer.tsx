import { css } from '@emotion/react';

import type { BattleQuizData } from '@/feat/battle/types';
import { QuizContentCard } from '@/feat/quiz/components/QuizContentCard';
import { QuizHeader } from '@/feat/quiz/components/QuizHeader';
import type { AnswerType, CorrectAnswerType, QuestionStatus } from '@/feat/quiz/types';

interface BattleQuizContainerProps {
  quizInfo: BattleQuizData;
  remainingSeconds: number;
  selectedAnswers: AnswerType[];
  quizSolutions: Array<{ correctAnswer: CorrectAnswerType | null; explanation: string } | null>;
  questionStatuses: QuestionStatus[];
  isCheckDisabled: boolean;
  isLastQuestion: boolean;
  isReviewMode: boolean;
  resultEndsAt: number | null;
  handleAnswerChange: (answer: AnswerType) => void;
  handleCheckAnswer: () => Promise<void>;
  handleNextQuestion: () => void;
}

export const BattleQuizContainer = ({
  quizInfo,
  remainingSeconds,
  selectedAnswers,
  quizSolutions,
  questionStatuses,
  isCheckDisabled,
  isLastQuestion,
  isReviewMode,
  resultEndsAt,
  handleAnswerChange,
  handleCheckAnswer,
  handleNextQuestion,
}: BattleQuizContainerProps) => (
  <div css={containerStyle}>
    <QuizHeader
      currentStep={quizInfo.index + 1}
      totalSteps={quizInfo.total}
      completedSteps={quizInfo.index}
      remainingSeconds={remainingSeconds}
      endsAt={resultEndsAt ?? quizInfo.endsAt}
    />
    <main css={mainStyle}>
      <QuizContentCard
        question={quizInfo.question}
        status={questionStatuses[quizInfo.index] ?? 'idle'}
        selectedAnswer={selectedAnswers[quizInfo.index] ?? null}
        correctAnswer={quizSolutions[quizInfo.index]?.correctAnswer ?? null}
        explanation={quizSolutions[quizInfo.index]?.explanation ?? ''}
        onAnswerChange={handleAnswerChange}
        isSubmitDisabled={isCheckDisabled}
        onCheck={handleCheckAnswer}
        onNext={handleNextQuestion}
        isLast={isLastQuestion}
        isReviewMode={isReviewMode}
        isBattleMode
        remainingSeconds={remainingSeconds}
        endsAt={resultEndsAt}
      />
    </main>
  </div>
);

const containerStyle = css`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
`;

const mainStyle = css`
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 0;
    align-items: stretch;
  }
`;
