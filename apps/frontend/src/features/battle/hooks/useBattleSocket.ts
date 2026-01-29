import { useCallback, useEffect, useRef } from 'react';

import type {
  BattleParticipant,
  BattleQuizData,
  BattleReward,
  BattleRoomSettings,
  BattleRoomStatus,
  Ranking,
} from '@/feat/battle/types';
import type {
  AnswerType,
  CorrectAnswerType,
  MatchingPair,
  QuestionStatus,
} from '@/feat/quiz/types';
import type { SocketContextValue } from '@/providers/SocketProvider';
import { useSocketContext } from '@/providers/SocketProvider';
import { useAuthStore } from '@/store/authStore';
import { useBattleStore } from '@/store/battleStore';
import { useToast } from '@/store/toastStore';

type BattleStateWithoutActions = Omit<ReturnType<typeof useBattleStore.getState>, 'actions'>;

export interface UseBattleSocketReturn extends SocketContextValue {
  battleState: BattleStateWithoutActions;
  battleStatus: BattleRoomStatus | null;
  joinBattle: (
    roomId: string,
    userData?: {
      userId?: number | null;
      displayName?: string;
      profileImageUrl?: string;
    },
    options?: {
      inviteToken?: string;
      settings?: BattleRoomSettings;
    },
  ) => void;
  leaveBattle: (roomId: string) => void;
  readyBattle: (roomId: string) => void;
  submitAnswer: (roomId: string, quizId: number, answer: AnswerType, index: number) => void;
  restartBattle: (roomId: string) => void;
  updateRoom: (roomId: string, settings: BattleRoomSettings) => void;
  startBattle: (roomId: string) => void;
  setSelectedAnswer: (index: number, answer: AnswerType) => void;
  setQuestionStatus: (index: number, status: QuestionStatus) => void;
}

export function useBattleSocket(): UseBattleSocketReturn {
  const socketContext = useSocketContext();
  const { socket, status: socketStatus, connect } = socketContext;
  const { showToast } = useToast();

  // 인증 정보
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const user = useAuthStore(state => state.user);
  const isAuthReady = useAuthStore(state => state.isAuthReady);

  // Zustand 스토어에서 상태와 액션 가져오기
  const battleState = useBattleStore(state => ({
    roomId: state.roomId,
    inviteToken: state.inviteToken,
    settings: state.settings,
    hostParticipantId: state.hostParticipantId,
    status: state.status,
    participants: state.participants,
    rankings: state.rankings,
    rewards: state.rewards,
    currentQuizIndex: state.currentQuizIndex,
    totalQuizzes: state.totalQuizzes,
    remainingSeconds: state.remainingSeconds,
    currentQuiz: state.currentQuiz,
    currentQuizId: state.currentQuizId,
    quizEndsAt: state.quizEndsAt,
    resultEndsAt: state.resultEndsAt,
    selectedAnswers: state.selectedAnswers,
    quizSolutions: state.quizSolutions,
    questionStatuses: state.questionStatuses,
  }));
  const {
    setBattleState,
    setParticipants,
    setQuiz,
    setQuizSolution,
    setQuestionStatus,
    setSelectedAnswer,
    reset,
  } = useBattleStore(state => state.actions);

  // ready 중복 요청 방지를 위한 ref
  const readySentRef = useRef(false);

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

  // roomId 변경 시 readySentRef 리셋
  useEffect(() => {
    readySentRef.current = false;
  }, [battleState.roomId]);

  // status가 'in_progress'가 되면 자동으로 ready 신호 전송
  useEffect(() => {
    if (battleState.status !== 'in_progress' || readySentRef.current) return;
    if (!socket || !battleState.roomId) return;

    readySentRef.current = true;
    socket.emit('battle:ready', { roomId: battleState.roomId });
  }, [battleState.status, battleState.roomId, socket]);

  const disconnect = useCallback(() => {
    socketContext.disconnect();
    reset();
  }, [socketContext, reset]);

  /**
   * 배틀 방 참가 요청을 보냅니다.
   * 소켓 연결 상태를 확인하고, 필요시 자동으로 연결합니다.
   * 중복 join을 방지하고, 다른 방으로 이동 시 상태를 초기화합니다.
   *
   * @param roomId 방 ID
   * @param userData 사용자 정보 (선택적, 없으면 인증 스토어에서 자동 수집)
   * @param options 추가 옵션 (inviteToken, settings 등)
   */
  const joinBattle = useCallback(
    (
      roomId: string,
      userData?: {
        userId?: number | null;
        displayName?: string;
        profileImageUrl?: string;
      },
      options?: {
        inviteToken?: string;
        settings?: BattleRoomSettings;
      },
    ) => {
      // 인증 준비 상태 확인
      if (!isAuthReady) {
        return;
      }

      // 소켓 연결 상태 확인 및 자동 연결
      if (socketStatus === 'disconnected') {
        connect();
        // 연결 완료를 기다리지 않고 반환 (연결 후 별도로 joinBattle 호출 필요)
        return;
      }

      if (!socket || socketStatus !== 'connected') {
        return;
      }

      // 현재 방 정보 확인
      const currentRoomId = battleState.roomId;
      const currentParticipants = battleState.participants;

      // 이미 같은 방에 join했으면 다시 join하지 않기
      if (currentRoomId === roomId && currentParticipants.length > 0) {
        return;
      }

      // 다른 방으로 진입하는 경우, 이전 상태 초기화
      if (currentRoomId && currentRoomId !== roomId) {
        reset();
      }

      // userData가 없으면 인증 스토어에서 자동 수집
      const finalUserData = userData ?? {
        userId: isLoggedIn && user ? user.id : null,
        displayName: isLoggedIn && user ? user.displayName : undefined,
        profileImageUrl: isLoggedIn && user ? (user.profileImageUrl ?? undefined) : undefined,
      };

      // battleStore에 roomId, inviteToken, settings 저장
      if (options?.inviteToken || options?.settings) {
        setBattleState({
          roomId,
          ...(options.inviteToken && { inviteToken: options.inviteToken }),
          ...(options.settings && { settings: options.settings }),
        });
      } else if (!currentRoomId) {
        // roomId만 저장 (inviteToken과 settings는 나중에 업데이트될 수 있음)
        setBattleState({ roomId });
      }

      // battle:join 이벤트 발송
      socket.emit('battle:join', {
        roomId,
        userId: finalUserData.userId ?? null,
        displayName: finalUserData.displayName,
        profileImageUrl: finalUserData.profileImageUrl,
      });
    },
    [
      isAuthReady,
      socketStatus,
      connect,
      socket,
      battleState.roomId,
      battleState.participants,
      reset,
      isLoggedIn,
      user,
      setBattleState,
    ],
  );

  /**
   * 방 설정 변경 요청을 보냅니다.
   * @param roomId 방 ID
   * @param settings 변경할 방 설정
   */
  const updateRoom = useCallback(
    (roomId: string, settings: BattleRoomSettings) => {
      if (!socket) return;

      socket.emit('battle:updateRoom', {
        roomId,
        fieldSlug: settings.fieldSlug,
        maxPlayers: settings.maxPlayers,
        timeLimitType: settings.timeLimitType,
      });
    },
    [socket],
  );

  /**
   * 배틀 준비 완료 신호를 보냅니다.
   * 동일한 문제에 대해 중복 요청이 가지 않도록 관리합니다.
   * @param roomId 방 ID
   */
  const readyBattle = useCallback(
    (roomId: string) => {
      if (!socket) return;

      // 이미 ready를 보냈으면 중복 요청 방지
      if (readySentRef.current) {
        return;
      }

      readySentRef.current = true;
      socket.emit('battle:ready', { roomId });
    },
    [socket],
  );

  /**
   * 배틀 게임 시작 요청을 보냅니다.
   * @param roomId 방 ID
   */
  const startBattle = useCallback(
    (roomId: string) => {
      if (!socket) return;

      socket.emit('battle:start', { roomId });
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
    // 배틀 상태 전체 반환 (페이지에서 여러 훅을 부르지 않도록)
    battleState,
    // 편의를 위한 별칭
    battleStatus: battleState.status,
    // 배틀 액션 메서드들
    joinBattle,
    leaveBattle,
    readyBattle,
    submitAnswer,
    restartBattle,
    updateRoom,
    startBattle,
    disconnect,
    // 스토어 액션들 (일관성을 위해 훅을 통해 제공)
    setSelectedAnswer,
    setQuestionStatus,
  };
}
