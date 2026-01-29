import { useCallback, useEffect } from 'react';

import type {
  BattleParticipant,
  BattleQuizData,
  BattleReward,
  BattleRoomSettings,
  BattleRoomStatus,
  Ranking,
} from '@/feat/battle/types';
import type { AnswerType, CorrectAnswerType, MatchingPair } from '@/feat/quiz/types';
import { useSocketContext } from '@/providers/SocketProvider';
import { useBattleStore } from '@/store/battleStore';
import { useToast } from '@/store/toastStore';

export function useBattleSocket() {
  const socketContext = useSocketContext();
  const { socket } = socketContext;
  const { showToast } = useToast();

  // Zustand 스토어에서 상태와 액션 가져오기
  const battleStatus = useBattleStore(state => state.status);
  const { setBattleState, setParticipants, setQuiz, setQuizSolution, setQuestionStatus, reset } =
    useBattleStore(state => state.actions);

  useEffect(() => {
    if (!socket) return;

    // 1. 참가자 명단 업데이트 (입장/퇴장 시)
    const handleParticipantsUpdated = (data: {
      participants: BattleParticipant[];
      leavingParticipant?: BattleParticipant;
    }) => {
      if (data.leavingParticipant)
        showToast(`${data.leavingParticipant.displayName}님이 퇴장하셨습니다.`);

      setParticipants(data.participants);
    };

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

      // settings가 없으면 data에서 기본값 사용, 있으면 병합
      setBattleState({
        settings: {
          fieldSlug: data.fieldSlug ?? currentSettings?.fieldSlug ?? 'backend',
          maxPlayers: data.maxPlayers ?? currentSettings?.maxPlayers ?? 5,
          timeLimitType: data.timeLimitType ?? currentSettings?.timeLimitType ?? 'recommended',
        },
      });
    };

    const handleBattleQuiz = (data: BattleQuizData) => {
      setBattleState({
        status: 'in_progress',
        resultEndsAt: null,
      });

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
    const handleBattleFinish = (data: { rankings?: Ranking[]; rewards?: BattleReward[] }) => {
      setBattleState({
        status: 'finished',
        rankings: data.rankings ?? [],
        rewards: data.rewards ?? [],
      });
    };
    const handleBattleInvalid = (data: { reason: string }) => {
      setBattleState({ status: 'invalid' });
      showToast(`${data.reason}`);
    };

    // 5. 에러 처리
    const handleBattleError = (error: { code: string; message: string }) => {
      if (error.code === 'ROOM_FULL' || error.code === 'ROOM_NOT_JOINABLE') {
        showToast('방에 입장할 수 없습니다. 다른 방을 이용해 주세요.');
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
  }, [
    socket,
    setBattleState,
    setParticipants,
    setQuiz,
    setQuizSolution,
    setQuestionStatus,
    showToast,
  ]);

  const disconnect = useCallback(() => {
    socketContext.disconnect();
    reset();
  }, [socketContext, reset]);

  /**
   * 배틀 방 참가 요청을 보냅니다.
   * @param roomId 방 ID
   * @param userData 사용자 정보 (userId, displayName, profileImageUrl)
   */
  const joinBattle = useCallback(
    (
      roomId: string,
      userData: {
        userId?: number | null;
        displayName?: string;
        profileImageUrl?: string;
      },
    ) => {
      if (!socket) return;

      socket.emit('battle:join', {
        roomId,
        userId: userData.userId ?? null,
        displayName: userData.displayName,
        profileImageUrl: userData.profileImageUrl,
      });
    },
    [socket],
  );

  /**
   * 배틀 방 퇴장 요청을 보내고 스토어를 초기화합니다.
   * @param roomId 방 ID
   */
  const leaveBattle = useCallback(
    (roomId: string) => {
      if (!socket) return;

      socket.emit('battle:leave', { roomId });
      reset();
    },
    [socket, reset],
  );

  /**
   * 배틀 준비 완료 신호를 보냅니다.
   * @param roomId 방 ID
   */
  const readyBattle = useCallback(
    (roomId: string) => {
      if (!socket) return;

      socket.emit('battle:ready', { roomId });
    },
    [socket],
  );

  /**
   * 정답 제출 요청을 보내고 해당 문제의 상태를 'checking'으로 변경합니다.
   * @param roomId 방 ID
   * @param quizId 퀴즈 ID
   * @param answer 제출 답안
   * @param index 문제 인덱스
   */
  const submitAnswer = useCallback(
    (roomId: string, quizId: number, answer: AnswerType, index: number) => {
      if (!socket) return;

      // 답안을 백엔드 형식에 맞게 변환
      const payloadAnswer: string | { pairs: MatchingPair[] } | null =
        typeof answer === 'string'
          ? answer
          : answer && typeof answer === 'object' && 'pairs' in answer
            ? { pairs: answer.pairs }
            : null;

      socket.emit('battle:submitAnswer', {
        roomId,
        quizId,
        answer: payloadAnswer,
      });

      // 제출 후 상태를 'checking'으로 변경
      setQuestionStatus(index, 'checking');
    },
    [socket, setQuestionStatus],
  );

  /**
   * 배틀 재시작 요청을 보내고 스토어를 초기화합니다.
   * @param roomId 방 ID
   */
  const restartBattle = useCallback(
    (roomId: string) => {
      if (!socket) return;

      socket.emit('battle:restart', { roomId });
      reset();
    },
    [socket, reset],
  );

  return {
    ...socketContext,
    battleStatus, // UI에서 접근하기 편하도록 분리해서 반환
    disconnect,
    // 배틀 액션 메서드들
    joinBattle,
    leaveBattle,
    readyBattle,
    submitAnswer,
    restartBattle,
  };
}
