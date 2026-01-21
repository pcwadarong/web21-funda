import { css } from '@emotion/react';

import { QuizContentCard } from '@/feat/quiz/components/QuizContentCard';
import { QuizHeader } from '@/feat/quiz/components/QuizHeader';
import type {
  AnswerType,
  CorrectAnswerType,
  QuestionStatus,
  QuizQuestion,
} from '@/feat/quiz/types';

interface QuizContainerProps {
  quizzes: QuizQuestion[];
  currentQuizIndex: number;
  currentQuestionStatus: QuestionStatus;
  selectedAnswers: AnswerType[];
  quizSolutions: Array<{ correctAnswer: CorrectAnswerType | null; explanation: string } | null>;
  questionStatuses: QuestionStatus[];
  isCheckDisabled: boolean;
  isLastQuestion: boolean;
  isReviewMode: boolean;
  handleAnswerChange: (answer: AnswerType) => void;
  handleCheckAnswer: () => Promise<void>;
  handleNextQuestion: () => void;
}

export const QuizContainer = ({
  quizzes,
  currentQuizIndex,
  currentQuestionStatus,
  selectedAnswers,
  quizSolutions,
  questionStatuses,
  isCheckDisabled,
  isLastQuestion,
  isReviewMode,
  handleAnswerChange,
  handleCheckAnswer,
  handleNextQuestion,
}: QuizContainerProps) => {
  const currentQuiz = quizzes[currentQuizIndex];

  if (!currentQuiz) return null;

  return (
    <div css={containerStyle}>
      <QuizHeader
        currentStep={currentQuizIndex + 1}
        totalSteps={quizzes.length}
        completedSteps={questionStatuses.filter(s => s === 'checked').length}
      />
      <main css={mainStyle}>
        <QuizContentCard
          question={currentQuiz}
          status={currentQuestionStatus}
          selectedAnswer={selectedAnswers[currentQuizIndex] ?? null}
          correctAnswer={quizSolutions[currentQuizIndex]?.correctAnswer ?? null}
          explanation={quizSolutions[currentQuizIndex]?.explanation ?? ''}
          onAnswerChange={handleAnswerChange}
          isSubmitDisabled={isCheckDisabled}
          onCheck={handleCheckAnswer}
          onNext={handleNextQuestion}
          isLast={isLastQuestion}
          isReviewMode={isReviewMode}
        />
      </main>
    </div>
  );
};

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
