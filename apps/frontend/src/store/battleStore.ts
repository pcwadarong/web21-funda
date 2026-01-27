import { create } from 'zustand';

import type {
  BattleParticipant,
  BattleRoomSettings,
  BattleRoomStatus,
  Ranking,
} from '@/feat/battle/types';

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

  // 3. 퀴즈 진행 정보
  currentQuizIndex: number;
  totalQuizzes: number;
  remainingSeconds: number;

  actions: {
    // 서버 이벤트를 통째로 동기화하는 액션
    setBattleState: (data: Partial<BattleState>) => void;
    setParticipants: (participants: BattleParticipant[]) => void;
    setRankings: (rankings: Ranking[]) => void;
    reset: () => void;
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
  currentQuizIndex: 0,
  totalQuizzes: 10,
  remainingSeconds: 0,

  actions: {
    setBattleState: data => set(state => ({ ...state, ...data })),
    setParticipants: participants => set({ participants }),
    setRankings: rankings => set({ rankings }),
    reset: () =>
      set({
        roomId: null,
        inviteToken: null,
        settings: null,
        hostParticipantId: null,
        status: null,
        participants: [],
        rankings: [],
        currentQuizIndex: 0,
        totalQuizzes: 10,
        remainingSeconds: 0,
      }),
  },
}));
