import { create } from 'zustand';

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
  QuestionStatus,
  QuizQuestion,
} from '@/feat/quiz/types';

/**
 * Battle Store State
 */
interface BattleState {
  // 1. 방 정보 및 설정
  roomId: string | null;
  inviteToken: string | null;
  settings: BattleRoomSettings | null;
  hostParticipantId: string | null;

  // 2. 게임 동적 상태
  status: BattleRoomStatus | null;
  participants: BattleParticipant[];
  rankings: Ranking[];
  rewards: BattleReward[];

  // 3. 퀴즈 진행 정보
  currentQuizIndex: number;
  totalQuizzes: number;
  remainingSeconds: number;
  currentQuiz: QuizQuestion | null;
  currentQuizId: number;
  quizEndsAt: number;
  resultEndsAt: number | null;
  serverTime: number;
  selectedAnswers: AnswerType[];
  quizSolutions: Array<{ correctAnswer: CorrectAnswerType | null; explanation: string } | null>;
  questionStatuses: QuestionStatus[];

  actions: {
    // actions를 제외한 필드만 업데이트할 수 있도록 타입 제한
    setBattleState: (data: Partial<Omit<BattleState, 'actions'>>) => void;
    setParticipants: (participants: BattleParticipant[]) => void;
    setRankings: (rankings: Ranking[]) => void;
    setQuiz: (data: BattleQuizData) => void;
    setSelectedAnswer: (index: number, answer: AnswerType) => void;
    setQuizSolution: (
      index: number,
      solution: { correctAnswer: CorrectAnswerType | null; explanation: string },
    ) => void;
    setQuestionStatus: (index: number, status: QuestionStatus) => void;
    reset: () => void;
    resetForRestart: () => void;
  };
}
/**
 * Battle Store
 *
 * Battle 상태를 전역으로 관리하는 Zustand 스토어입니다.
 * 페이지 이동 시에도 상태가 유지됩니다.
 */
export const useBattleStore = create<BattleState>(set => ({
  roomId: null,
  inviteToken: null,
  settings: null,
  hostParticipantId: null,
  status: null,
  participants: [],
  rankings: [],
  rewards: [],
  currentQuizIndex: 0,
  totalQuizzes: 10,
  remainingSeconds: 0,
  currentQuiz: null,
  currentQuizId: 0,
  quizEndsAt: 0,
  resultEndsAt: null,
  serverTime: 0,
  selectedAnswers: [],
  quizSolutions: [],
  questionStatuses: [],

  actions: {
    setBattleState: data => set(state => ({ ...state, ...data })),
    setParticipants: participants => set({ participants }),
    setRankings: rankings => set({ rankings }),
    setQuiz: data =>
      set(state => {
        const ensureLength = <T>(arr: T[], length: number, fill: T): T[] =>
          arr.length >= length ? arr : Array.from({ length }, (_, i) => arr[i] ?? fill);

        return {
          currentQuiz: data.question,
          currentQuizIndex: data.index,
          currentQuizId: data.quizId,
          totalQuizzes: data.total,
          quizEndsAt: data.endsAt,
          serverTime: data.serverTime,
          selectedAnswers: ensureLength(state.selectedAnswers, data.total, null),
          quizSolutions: ensureLength(state.quizSolutions, data.total, null),
          questionStatuses: ensureLength(state.questionStatuses, data.total, 'idle'),
        };
      }),
    setSelectedAnswer: (index, answer) =>
      set(state => {
        const next = [...state.selectedAnswers];
        next[index] = answer;
        return { selectedAnswers: next };
      }),
    setQuizSolution: (index, solution) =>
      set(state => {
        const next = [...state.quizSolutions];
        next[index] = solution;
        return { quizSolutions: next };
      }),
    setQuestionStatus: (index, status) =>
      set(state => {
        const next = [...state.questionStatuses];
        next[index] = status;
        return { questionStatuses: next };
      }),
    reset: () =>
      set({
        roomId: null,
        inviteToken: null,
        settings: null,
        hostParticipantId: null,
        status: null,
        participants: [],
        rankings: [],
        rewards: [],
        currentQuizIndex: 0,
        totalQuizzes: 10,
        remainingSeconds: 0,
        currentQuiz: null,
        currentQuizId: 0,
        quizEndsAt: 0,
        resultEndsAt: 0,
        serverTime: 0,
        selectedAnswers: [],
        quizSolutions: [],
        questionStatuses: [],
      }),
    resetForRestart: () =>
      set(state => ({
        roomId: state.roomId,
        inviteToken: state.inviteToken,
        settings: state.settings,
        hostParticipantId: state.hostParticipantId,
        status: 'waiting',
        participants: state.participants,
        rankings: [],
        rewards: [],
        currentQuizIndex: 0,
        totalQuizzes: state.totalQuizzes,
        remainingSeconds: 0,
        currentQuiz: null,
        currentQuizId: 0,
        quizEndsAt: 0,
        resultEndsAt: 0,
        serverTime: 0,
        selectedAnswers: [],
        quizSolutions: [],
        questionStatuses: [],
      })),
  },
}));
