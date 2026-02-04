import { useCallback, useEffect, useMemo } from 'react';

import correctSound from '@/assets/audio/correct.mp3';
import wrongSound from '@/assets/audio/wrong.mp3';
import { Loading } from '@/comp/Loading';
import { BattlePlayContainer } from '@/feat/battle/components/play/BattlePlayContainer';
import { useBattleSocket } from '@/feat/battle/hooks/useBattleSocket';
import type { AnswerType } from '@/feat/quiz/types';
import { useSound } from '@/hooks/useSound';

export const BattlePlayPage = () => {
  const { battleState, socket, setSelectedAnswer, setQuestionStatus, submitAnswer } =
    useBattleSocket();
  const { playSound } = useSound();

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

  // battle:result 이벤트에서 정답/오답 소리 재생
  useEffect(() => {
    if (!socket) return;

    const handleBattleResult = (data: {
      isCorrect?: boolean;
      quizResult?: {
        solution?: {
          explanation?: string;
          correct_option_id?: string;
          correct_pairs?: Array<{ left: string; right: string }>;
        };
      };
    }) => {
      if (data.isCorrect) {
        playSound({ src: correctSound, currentTime: 0.05 });
      } else {
        playSound({ src: wrongSound, currentTime: 0.05 });
      }
    };

    socket.on('battle:result', handleBattleResult);

    return () => {
      socket.off('battle:result', handleBattleResult);
    };
  }, [socket, playSound]);

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
    <BattlePlayContainer
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
  );
};
