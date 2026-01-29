import { useCallback, useEffect, useMemo } from 'react';

import { Loading } from '@/comp/Loading';
import { BattleQuizContainer } from '@/feat/battle/components/BattleQuizContainer';
import { useBattleSocket } from '@/feat/battle/hooks/useBattleSocket';
import type { AnswerType } from '@/feat/quiz/types';

export const BattleQuizPage = () => {
  const { battleState, socket, setSelectedAnswer, setQuestionStatus, submitAnswer } =
    useBattleSocket();

  // battleState에서 필요한 상태 추출
  const {
    roomId,
    currentQuiz,
    currentQuizId,
    currentQuizIndex,
    totalQuizzes,
    selectedAnswers,
    quizSolutions,
    questionStatuses,
    rankings,
  } = battleState;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleAnswerChange = useCallback(
    (answer: AnswerType) => {
      setSelectedAnswer(currentQuizIndex, answer);
    },
    [currentQuizIndex, setSelectedAnswer],
  );

  const handleCheckAnswer = useCallback(() => {
    if (!roomId || !currentQuizId) return;

    const answer = selectedAnswers[currentQuizIndex] ?? null;
    submitAnswer(roomId, currentQuizId, answer, currentQuizIndex);
  }, [roomId, currentQuizId, selectedAnswers, currentQuizIndex, submitAnswer]);

  const handleNextQuestion = useCallback(() => {
    // 서버가 다음 문제를 내려주므로 클라이언트에서는 상태만 초기화
    setQuestionStatus(currentQuizIndex, 'idle');
  }, [currentQuizIndex, setQuestionStatus]);

  const isCheckDisabled = useMemo(() => {
    const statusForCurrent = questionStatuses[currentQuizIndex] ?? 'idle';
    const selected = selectedAnswers[currentQuizIndex];
    return statusForCurrent !== 'idle' || selected == null;
  }, [questionStatuses, selectedAnswers, currentQuizIndex]);

  if (!currentQuiz) return <Loading text="배틀 로딩 중" />;

  const quizInfo = {
    quizId: currentQuizId,
    question: currentQuiz,
    index: currentQuizIndex,
    total: totalQuizzes,
  };

  return (
    <>
      <BattleQuizContainer
        quizInfo={quizInfo}
        selectedAnswers={selectedAnswers}
        quizSolutions={quizSolutions}
        questionStatuses={questionStatuses}
        isCheckDisabled={isCheckDisabled}
        isLastQuestion={currentQuizIndex + 1 >= totalQuizzes}
        isReviewMode={false}
        handleAnswerChange={handleAnswerChange}
        handleCheckAnswer={handleCheckAnswer}
        handleNextQuestion={handleNextQuestion}
        rankings={rankings}
        currentParticipantId={socket?.id ?? null}
      />
    </>
  );
};
