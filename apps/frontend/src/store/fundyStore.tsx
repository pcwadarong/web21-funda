import { createContext, type ReactNode, useContext, useRef } from 'react';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

import type { FundyAnimationConfig } from '@/feat/fundy/types';

type FundyAnimationUpdate =
  | Partial<FundyAnimationConfig>
  | ((prev: FundyAnimationConfig) => FundyAnimationConfig);

interface FundyState {
  animation: FundyAnimationConfig;
  isActionLocked: boolean;
  actions: {
    setAnimation: (update: FundyAnimationUpdate) => void;
    setSystemAnimation: (update: Partial<FundyAnimationConfig>) => void;
    setActionLocked: (locked: boolean) => void;
    triggerHello: () => void;
    reset: () => void;
  };
}

const defaultAnimation: FundyAnimationConfig = {
  blink: false,
  lookAt: false,
  helloAction: 0,
  speedMultiplier: 1,
  smile: false,
  smileSoft: false,
  bigSmile: false,
  wink: false,
  openMouth: false,
};

const createFundyStore = (initial?: Partial<FundyAnimationConfig>) =>
  createStore<FundyState>(set => ({
    animation: { ...defaultAnimation, ...initial },
    isActionLocked: false,
    actions: {
      setAnimation: update =>
        set(state => {
          if (state.isActionLocked) return state;
          const next =
            typeof update === 'function'
              ? update(state.animation)
              : { ...state.animation, ...update };
          return { animation: next };
        }),
      setSystemAnimation: update =>
        set(state => ({ animation: { ...state.animation, ...update } })),
      setActionLocked: locked => set({ isActionLocked: locked }),
      triggerHello: () =>
        set(state => ({
          animation: {
            ...state.animation,
            helloAction: (state.animation.helloAction ?? 0) + 1,
          },
        })),
      reset: () => set({ animation: defaultAnimation, isActionLocked: false }),
    },
  }));

type FundyStore = ReturnType<typeof createFundyStore>;

const FundyStoreContext = createContext<FundyStore | null>(null);

export function FundyStoreProvider({
  children,
  initialAnimation,
}: {
  children: ReactNode;
  initialAnimation?: Partial<FundyAnimationConfig>;
}) {
  const storeRef = useRef<FundyStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createFundyStore(initialAnimation);
  }

  return (
    <FundyStoreContext.Provider value={storeRef.current}>{children}</FundyStoreContext.Provider>
  );
}

export function useFundyStore<T>(selector: (state: FundyState) => T) {
  const store = useContext(FundyStoreContext);
  if (!store) throw new Error('useFundyStore must be used within FundyStoreProvider');
  return useStore(store, selector);
}
