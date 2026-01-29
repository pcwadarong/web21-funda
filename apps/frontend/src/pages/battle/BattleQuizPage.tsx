import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Loading } from '@/comp/Loading';
import { useBattleSocket } from '@/feat/battle/hooks/useBattleSocket';
import type { AnswerType } from '@/feat/quiz/types';
import { BattleQuizContainer } from '@/features/battle/components/BattleQuizContainer';
import { useBattleStore } from '@/store/battleStore';

export const BattleQuizPage = () => {
  const { socket } = useBattleSocket();

  const navigate = useNavigate();

  // 기본 정보
  const roomId = useBattleStore(state => state.roomId);
  const inviteToken = useBattleStore(state => state.inviteToken);
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

  useEffect(() => {
    if (status === 'invalid' && inviteToken) {
      navigate(`/battle`);
    }
  }, [status, inviteToken, navigate]);

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
