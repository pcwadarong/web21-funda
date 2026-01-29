import { useCallback, useEffect, useMemo, useRef } from 'react';

import { Loading } from '@/comp/Loading';
import type { AnswerType } from '@/feat/quiz/types';
import { BattleQuizContainer } from '@/features/battle/components/BattleQuizContainer';
import { useSocketContext } from '@/providers/SocketProvider';
import { useBattleStore } from '@/store/battleStore';

export const BattleQuizPage = () => {
  const { socket, emitEvent } = useSocketContext();

  // 기본 정보
  const roomId = useBattleStore(state => state.roomId);
  const status = useBattleStore(state => state.status);

  // 퀴즈 데이터
  const currentQuiz = useBattleStore(state => state.currentQuiz);
  const currentQuizId = useBattleStore(state => state.currentQuizId);
  const currentQuizIndex = useBattleStore(state => state.currentQuizIndex);
  const totalQuizzes = useBattleStore(state => state.totalQuizzes);

  // 답변 및 결과
  const selectedAnswers = useBattleStore(state => state.selectedAnswers);
  const quizSolutions = useBattleStore(state => state.quizSolutions);
  const questionStatuses = useBattleStore(state => state.questionStatuses);
  const rankings = useBattleStore(state => state.rankings);

  // 액션
  const { setSelectedAnswer, setQuestionStatus } = useBattleStore(state => state.actions);
  const readySentRef = useRef(false);

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

  useEffect(() => {
    readySentRef.current = false;
  }, [roomId]);

  useEffect(() => {
    // socket과 roomId는 BattleFlowManager에서 검사하므로 여기서는 status만 확인
    if (status !== 'in_progress' || readySentRef.current) return;

    // 문제 로딩 전에 서버에 준비 완료 신호를 보낸다.
    if (socket && roomId) {
      readySentRef.current = true;
      emitEvent('battle:ready', { roomId });
    }
  }, [socket, roomId, status, emitEvent]);

  const handleAnswerChange = useCallback(
    (answer: AnswerType) => {
      setSelectedAnswer(currentQuizIndex, answer);
    },
    [currentQuizIndex, setSelectedAnswer],
  );

  const handleCheckAnswer = useCallback(async () => {
    // socket과 roomId는 BattleFlowManager에서 검사하므로 여기서는 currentQuizId만 확인
    if (!socket || !roomId || !currentQuizId) return;

    setQuestionStatus(currentQuizIndex, 'checking');

    emitEvent('battle:submitAnswer', {
      roomId,
      quizId: currentQuizId,
      answer: selectedAnswers[currentQuizIndex] ?? null,
    });
  }, [
    socket,
    roomId,
    currentQuizId,
    selectedAnswers,
    currentQuizIndex,
    setQuestionStatus,
    emitEvent,
  ]);

  const handleNextQuestion = useCallback(() => {
    // 서버가 다음 문제를 내려주므로 클라이언트에서는 상태만 초기화
    setQuestionStatus(currentQuizIndex, 'idle');
  }, [currentQuizIndex, setQuestionStatus]);

  const isCheckDisabled = useMemo(() => {
    const statusForCurrent = questionStatuses[currentQuizIndex] ?? 'idle';
    const selected = selectedAnswers[currentQuizIndex];
    return statusForCurrent !== 'idle' || selected == null;
  }, [questionStatuses, selectedAnswers, currentQuizIndex]);

  if (status !== 'in_progress' || !currentQuiz) return <Loading text="배틀 로딩 중" />;

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
