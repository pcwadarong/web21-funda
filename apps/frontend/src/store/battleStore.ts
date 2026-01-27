import { create } from 'zustand';

/**
 * Battle Room Status 타입
 * Backend의 battle-state.ts와 동일한 타입 정의
 */
export type BattleRoomStatus = 'waiting' | 'in_progress' | 'finished' | 'invalid';

/**
 * Battle Store State
 */
interface BattleState {
  battleStatus: BattleRoomStatus | null;
  roomId: string | null;
  actions: {
    setBattleStatus: (status: BattleRoomStatus | null) => void;
    setRoomId: (id: string | null) => void;
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
  battleStatus: null,
  roomId: null,
  actions: {
    setBattleStatus: status => set({ battleStatus: status }),
    setRoomId: id => set({ roomId: id }),
    reset: () => set({ battleStatus: null, roomId: null }),
  },
}));
