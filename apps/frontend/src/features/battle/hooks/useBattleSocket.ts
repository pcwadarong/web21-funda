import { useCallback, useEffect } from 'react';

import type {
  BattleParticipant,
  BattleQuizData,
  BattleRoomSettings,
  BattleRoomStatus,
  Ranking,
} from '@/feat/battle/types';
import type { CorrectAnswerType, MatchingPair } from '@/feat/quiz/types';
import { useSocketContext } from '@/providers/SocketProvider';
import { useBattleStore } from '@/store/battleStore';

export function useBattleSocket() {
  const socketContext = useSocketContext();
  const { socket } = socketContext;

  // Zustand 스토어에서 상태와 액션 가져오기
  const battleStatus = useBattleStore(state => state.status);
  const { setBattleState, setParticipants, setQuiz, setQuizSolution, setQuestionStatus, reset } =
    useBattleStore(state => state.actions);

  useEffect(() => {
    if (!socket) return;

    // 1. 참가자 명단 업데이트 (입장/퇴장 시)
    const handleParticipantsUpdated = (data: { participants: BattleParticipant[] }) =>
      setParticipants(data.participants);

    // 2. 게임 전체 상태 업데이트 (배틀 상태, 남은 시간, 순위)
    const handleBattleState = (data: {
      status: BattleRoomStatus;
      remainingSeconds: number;
      rankings: Ranking[];
      resultEndsAt?: number;
    }) => {
      setBattleState({
        status: data.status,
        remainingSeconds: data.remainingSeconds,
        rankings: data.rankings,
        resultEndsAt: data.resultEndsAt ?? undefined,
      });
    };

    // 3. 방 설정 변경 브로드캐스트
    const handleRoomUpdated = (data: Partial<BattleRoomSettings>) => {
      // 호출 시점의 최신 상태 로딩
      const currentSettings = useBattleStore.getState().settings;
      if (!currentSettings) return;

      setBattleState({
        settings: {
          ...currentSettings,
          ...data,
        },
      });
    };

    const handleBattleQuiz = (data: BattleQuizData) => {
      setQuiz(data);
    };

    const handleBattleResult = (data: {
      quizResult?: {
        solution?: {
          explanation?: string;
          correct_option_id?: string;
          correct_pairs?: MatchingPair[];
        };
      };
    }) => {
      const currentIndex = useBattleStore.getState().currentQuizIndex;
      const solution = data.quizResult?.solution ?? {};
      const correctAnswer: CorrectAnswerType | null =
        solution.correct_pairs !== undefined
          ? { pairs: solution.correct_pairs }
          : solution.correct_option_id
            ? String(solution.correct_option_id)
            : null;

      setQuizSolution(currentIndex, {
        correctAnswer,
        explanation: solution.explanation ?? '',
      });
      setQuestionStatus(currentIndex, 'checked');
    };

    // 4. 게임 종료 및 무효 처리
    const handleBattleFinish = () => setBattleState({ status: 'finished' });
    const handleBattleInvalid = (data: { reason: string }) => {
      setBattleState({ status: 'invalid' });
      console.warn('Game Invalid:', data.reason); //TODO: 이유 UI에 출력
    };

    // 5. 에러 처리
    const handleBattleError = (error: { code: string; message: string }) => {
      if (error.code === 'ROOM_FULL' || error.code === 'ROOM_NOT_JOINABLE') {
        setBattleState({ status: 'invalid' });
      }
    };

    socket.on('battle:participantsUpdated', handleParticipantsUpdated);
    socket.on('battle:state', handleBattleState);
    socket.on('battle:roomUpdated', handleRoomUpdated);
    socket.on('battle:quiz', handleBattleQuiz);
    socket.on('battle:result', handleBattleResult);
    socket.on('battle:finish', handleBattleFinish);
    socket.on('battle:invalid', handleBattleInvalid);
    socket.on('battle:error', handleBattleError);

    return () => {
      socket.off('battle:participantsUpdated', handleParticipantsUpdated);
      socket.off('battle:state', handleBattleState);
      socket.off('battle:roomUpdated', handleRoomUpdated);
      socket.off('battle:quiz', handleBattleQuiz);
      socket.off('battle:result', handleBattleResult);
      socket.off('battle:finish', handleBattleFinish);
      socket.off('battle:invalid', handleBattleInvalid);
      socket.off('battle:error', handleBattleError);
    };
  }, [socket, setBattleState, setParticipants, setQuiz, setQuizSolution, setQuestionStatus]);

  const disconnect = useCallback(() => {
    socketContext.disconnect();
    reset();
  }, [socketContext, reset]);

  return {
    ...socketContext,
    battleStatus, // UI에서 접근하기 편하도록 분리해서 반환
    disconnect,
  };
}
