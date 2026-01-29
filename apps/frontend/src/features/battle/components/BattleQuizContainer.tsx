import { css } from '@emotion/react';

import type { BattleQuizData, Ranking } from '@/feat/battle/types';
import { QuizContentCard } from '@/feat/quiz/components/QuizContentCard';
import { QuizHeader } from '@/feat/quiz/components/QuizHeader';
import type { AnswerType, CorrectAnswerType, QuestionStatus } from '@/feat/quiz/types';
import { BattleRankBar } from '@/features/battle/components/BattleRankBar';

interface BattleQuizContainerProps {
  quizInfo: Omit<BattleQuizData, 'endsAt'>;
  selectedAnswers: AnswerType[];
  quizSolutions: Array<{ correctAnswer: CorrectAnswerType | null; explanation: string } | null>;
  questionStatuses: QuestionStatus[];
  isCheckDisabled: boolean;
  isLastQuestion: boolean;
  isReviewMode: boolean;
  rankings: Ranking[];
  currentParticipantId?: string | null;
  handleAnswerChange: (answer: AnswerType) => void;
  handleCheckAnswer: () => Promise<void>;
  handleNextQuestion: () => void;
}

export const BattleQuizContainer = ({
  quizInfo,
  selectedAnswers,
  quizSolutions,
  questionStatuses,
  isCheckDisabled,
  isLastQuestion,
  isReviewMode,
  rankings,
  currentParticipantId,
  handleAnswerChange,
  handleCheckAnswer,
  handleNextQuestion,
}: BattleQuizContainerProps) => (
  <div css={containerStyle}>
    <QuizHeader
      currentStep={quizInfo.index + 1}
      totalSteps={quizInfo.total}
      completedSteps={quizInfo.index}
      isBattleMode
    />
    <main css={mainStyle}>
      <BattleRankBar
        rankings={rankings}
        currentParticipantId={currentParticipantId}
        totalParticipants={rankings.length}
      />
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
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: auto;
  padding: 24px;
  gap: 24px;

  @media (max-width: 768px) {
    padding: 0;
    align-items: stretch;
  }
`;
