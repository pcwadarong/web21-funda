import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Loading } from '@/comp/Loading';
import { useBattleSocket } from '@/feat/battle/hooks/useBattleSocket';
import type { AnswerType } from '@/feat/quiz/types';
import { BattleQuizContainer } from '@/features/battle/components/BattleQuizContainer';
import { useBattleStore } from '@/store/battleStore';

export const BattleQuizPage = () => {
  const { socket } = useBattleSocket();
  const navigate = useNavigate();
  const {
    roomId,
    currentQuiz,
    currentQuizIndex,
    currentQuizId,
    totalQuizzes,
    quizEndsAt,
    remainingSeconds,
    status,
    actions,
    selectedAnswers,
    quizSolutions,
    questionStatuses,
    resultEndsAt,
    rankings,
  } = useBattleStore();
  const { setSelectedAnswer, setQuestionStatus } = actions;
  const readySentRef = useRef(false);

  useEffect(() => {
    readySentRef.current = false;
  }, [roomId]);

  useEffect(() => {
    if (!roomId) {
      navigate('/battle');
      return;
    }
  }, [roomId, status, navigate]);

  useEffect(() => {
    if (!socket || !roomId) {
      return;
    }

    if (status !== 'in_progress') {
      return;
    }

    if (readySentRef.current) {
      return;
    }

    // 문제 로딩 전에 서버에 준비 완료 신호를 보낸다.
    readySentRef.current = true;
    socket.emit('battle:ready', { roomId });
  }, [socket, roomId, status]);

  const handleAnswerChange = useCallback(
    (answer: AnswerType) => {
      setSelectedAnswer(currentQuizIndex, answer);
    },
    [currentQuizIndex, setSelectedAnswer],
  );

  const handleCheckAnswer = useCallback(async () => {
    if (!socket || !roomId || !currentQuizId) return;

    setQuestionStatus(currentQuizIndex, 'checking');

    socket.emit('battle:submitAnswer', {
      roomId,
      quizId: currentQuizId,
      answer: selectedAnswers[currentQuizIndex] ?? null,
    });
  }, [socket, roomId, currentQuizId, selectedAnswers, currentQuizIndex, setQuestionStatus]);

  const handleNextQuestion = useCallback(() => {
    // 서버가 다음 문제를 내려주므로 클라이언트에서는 상태만 초기화
    setQuestionStatus(currentQuizIndex, 'idle');
  }, [currentQuizIndex, setQuestionStatus]);

  const isCheckDisabled = useMemo(() => {
    const statusForCurrent = questionStatuses[currentQuizIndex] ?? 'idle';
    const selected = selectedAnswers[currentQuizIndex];
    return statusForCurrent !== 'idle' || selected == null;
  }, [questionStatuses, selectedAnswers, currentQuizIndex]);

  if (status !== 'in_progress' || !currentQuiz) return <Loading />;

  const quizInfo = {
    quizId: currentQuizId,
    question: currentQuiz,
    index: currentQuizIndex,
    total: totalQuizzes,
    endsAt: quizEndsAt,
  };

  return (
    <>
      <BattleQuizContainer
        quizInfo={quizInfo}
        remainingSeconds={remainingSeconds}
        selectedAnswers={selectedAnswers}
        quizSolutions={quizSolutions}
        questionStatuses={questionStatuses}
        isCheckDisabled={isCheckDisabled}
        isLastQuestion={currentQuizIndex + 1 >= totalQuizzes}
        isReviewMode={false}
        handleAnswerChange={handleAnswerChange}
        handleCheckAnswer={handleCheckAnswer}
        handleNextQuestion={handleNextQuestion}
        resultEndsAt={resultEndsAt}
        rankings={rankings}
        currentParticipantId={socket?.id ?? null}
      />
    </>
  );
};
