import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { useBattleSocket } from '@/feat/battle/hooks/useBattleSocket';
import type { AnswerType } from '@/feat/quiz/types';
import { BattleQuizContainer } from '@/features/battle/components/BattleQuizContainer';
import { battleService } from '@/services/battleService';
import { useBattleStore } from '@/store/battleStore';

export const BattleQuizPage = () => {
  const { inviteToken } = useParams<{ inviteToken: string }>();
  const { socket, joinRoom, leaveRoom } = useBattleSocket();
  const {
    roomId,
    currentQuiz,
    currentQuizIndex,
    currentQuizId,
    totalQuizzes,
    quizEndsAt,
    remainingSeconds,
    hostParticipantId,
    status,
    actions,
    selectedAnswers,
    quizSolutions,
    questionStatuses,
    resultEndsAt,
    rankings,
  } = useBattleStore();
  const { setBattleState, setSelectedAnswer, setQuestionStatus } = actions;

  // 임시: 테스트용
  const hasJoinedRef = useRef(false);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (roomId || !inviteToken) return;

    battleService
      .joinBattleRoom(inviteToken)
      .then(result => {
        if (!result.canJoin) {
          return;
        }

        setBattleState({ roomId: result.roomId, inviteToken });
      })
      .catch(error => {
        console.error('Failed to join battle room:', error);
      });
  }, [inviteToken, roomId, setBattleState]);

  useEffect(() => {
    if (!roomId || hasJoinedRef.current) return;
    hasJoinedRef.current = true;
    joinRoom(roomId);
    return () => leaveRoom(roomId);
  }, [roomId, joinRoom, leaveRoom]);

  useEffect(() => {
    if (!roomId || !socket?.connected || hasStartedRef.current) return;

    const timerId = window.setTimeout(() => {
      if (socket.id === hostParticipantId && status === 'waiting') {
        hasStartedRef.current = true;
        socket.emit('battle:start', { roomId });
      }
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [roomId, socket?.connected, socket, hostParticipantId, status]);

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

  if (!currentQuiz) {
    return (
      <button
        type="button"
        onClick={() => socket?.emit('battle:start', { roomId })}
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 9999,
          padding: '8px 12px',
          background: '#111827',
          color: '#fff',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        battle:start 테스트
      </button>
    );
  }
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
      <button
        type="button"
        onClick={() => socket?.emit('battle:start', { roomId })}
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 9999,
          padding: '8px 12px',
          background: '#111827',
          color: '#fff',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        battle:start 테스트
      </button>
    </>
  );
};
