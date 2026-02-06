import { css } from '@emotion/react';
import { useEffect, useState } from 'react';

import { BattleRankBar } from '@/feat/battle/components/play/BattleRankBar';
import type { BattleQuizData, Ranking } from '@/feat/battle/types';
import { QuizContentCard } from '@/feat/quiz/components/QuizContentCard';
import { QuizHeader } from '@/feat/quiz/components/QuizHeader';
import type { AnswerType, CorrectAnswerType, QuestionStatus } from '@/feat/quiz/types';

interface BattlePlayContainerProps {
  quizInfo: Omit<BattleQuizData, 'endsAt' | 'serverTime'>;
  selectedAnswers: AnswerType[];
  quizSolutions: Array<{ correctAnswer: CorrectAnswerType | null; explanation: string } | null>;
  questionStatuses: QuestionStatus[];
  isCheckDisabled: boolean;
  isLastQuestion: boolean;
  isReviewMode: boolean;
  rankings: Ranking[];
  currentParticipantId?: string | null;
  scoreDelta: number;
  handleAnswerChange: (answer: AnswerType) => void;
  handleCheckAnswer: () => void;
  handleNextQuestion: () => void;
}

export const BattlePlayContainer = ({
  quizInfo,
  selectedAnswers,
  quizSolutions,
  questionStatuses,
  isCheckDisabled,
  isLastQuestion,
  isReviewMode,
  rankings,
  currentParticipantId,
  scoreDelta,
  handleAnswerChange,
  handleCheckAnswer,
  handleNextQuestion,
}: BattlePlayContainerProps) => {
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setSelectionPosition(null);
  }, [quizInfo.quizId]);

  return (
    <div css={containerStyle}>
      <QuizHeader
        currentStep={quizInfo.index + 1}
        totalSteps={quizInfo.total}
        completedSteps={
          questionStatuses[quizInfo.index] === 'checked' ? quizInfo.index + 1 : quizInfo.index
        }
        status={questionStatuses[quizInfo.index] ?? 'idle'}
        isBattleMode
      />
      <div css={subHeaderStyle}>
        <BattleRankBar
          rankings={rankings}
          currentParticipantId={currentParticipantId}
          totalParticipants={rankings.length}
          scoreDelta={scoreDelta}
          startPosition={selectionPosition}
        />
      </div>
      <main css={mainStyle}>
        <QuizContentCard
          question={quizInfo.question}
          status={questionStatuses[quizInfo.index] ?? 'idle'}
          selectedAnswer={selectedAnswers[quizInfo.index] ?? null}
          correctAnswer={quizSolutions[quizInfo.index]?.correctAnswer ?? null}
          explanation={quizSolutions[quizInfo.index]?.explanation ?? ''}
          onAnswerChange={handleAnswerChange}
          onSelectPosition={setSelectionPosition}
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
};

const containerStyle = css`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
`;

const subHeaderStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
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
