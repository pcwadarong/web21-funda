import { createContext, type ReactNode, useContext, useRef } from 'react';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

import type { FundyAnimationConfig, FundyIdleExpression } from '@/feat/fundy/types';

type FundyAnimationUpdate =
  | Partial<FundyAnimationConfig>
  | ((prev: FundyAnimationConfig) => FundyAnimationConfig);

interface FundyState {
  animation: FundyAnimationConfig;
  isActionLocked: boolean;
  idleExpression: FundyIdleExpression;
  idleExpressionHold: boolean;
  idleExpressionDelayMs: number;
  forceActionRelease: boolean;
  actions: {
    setAnimation: (update: FundyAnimationUpdate) => void;
    setSystemAnimation: (update: Partial<FundyAnimationConfig>) => void;
    setActionLocked: (locked: boolean) => void;
    setIdleExpression: (expression: FundyIdleExpression) => void;
    setIdleExpressionHold: (hold: boolean) => void;
    setIdleExpressionDelayMs: (delayMs: number) => void;
    setForceActionRelease: (enabled: boolean) => void;
    triggerHello: () => void;
    triggerPeek: () => void;
    triggerFall: () => void;
    triggerBattle: () => void;
    triggerTrophy: () => void;
    reset: () => void;
  };
}

const defaultAnimation: FundyAnimationConfig = {
  blink: false,
  lookAt: false,
  helloAction: 0,
  peekAction: 0,
  fallAction: 0,
  battleAction: 0,
  trophyAction: 0,
  trophyAction: 0,
  speedMultiplier: 1,
  smile: false,
  smileSoft: false,
  bigSmile: false,
  wink: false,
  angry: false,
  openMouth: false,
};

const createFundyStore = (
  initial?: Partial<FundyAnimationConfig>,
  idleExpression: FundyIdleExpression = 'default',
  idleExpressionHold: boolean = true,
  idleExpressionDelayMs: number = 300,
) =>
  createStore<FundyState>(set => ({
    animation: { ...defaultAnimation, ...initial },
    isActionLocked: false,
    idleExpression,
    idleExpressionHold,
    idleExpressionDelayMs,
    forceActionRelease: false,
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
      setIdleExpression: expression => set({ idleExpression: expression }),
      setIdleExpressionHold: hold => set({ idleExpressionHold: hold }),
      setIdleExpressionDelayMs: delayMs => set({ idleExpressionDelayMs: delayMs }),
      setForceActionRelease: enabled => set({ forceActionRelease: enabled }),
      triggerHello: () =>
        set(state => ({
          animation: {
            ...state.animation,
            helloAction: (state.animation.helloAction ?? 0) + 1,
          },
        })),
      triggerPeek: () =>
        set(state => ({
          animation: {
            ...state.animation,
            peekAction: (state.animation.peekAction ?? 0) + 1,
          },
        })),
      triggerFall: () =>
        set(state => ({
          animation: {
            ...state.animation,
            fallAction: (state.animation.fallAction ?? 0) + 1,
          },
        })),
      triggerBattle: () =>
        set(state => ({
          animation: {
            ...state.animation,
            battleAction: (state.animation.battleAction ?? 0) + 1,
          },
        })),
      triggerTrophy: () =>
        set(state => ({
          animation: {
            ...state.animation,
            trophyAction: (state.animation.trophyAction ?? 0) + 1,
          },
        })),
      reset: () =>
        set({
          animation: defaultAnimation,
          isActionLocked: false,
          idleExpression: 'default',
          idleExpressionHold: true,
          idleExpressionDelayMs: 300,
        }),
    },
  }));

type FundyStore = ReturnType<typeof createFundyStore>;

const FundyStoreContext = createContext<FundyStore | null>(null);

export function FundyStoreProvider({
  children,
  initialAnimation,
  idleExpression = 'default',
  idleExpressionHold = false,
  idleExpressionDelayMs = 300,
}: {
  children: ReactNode;
  initialAnimation?: Partial<FundyAnimationConfig>;
  idleExpression?: FundyIdleExpression;
  idleExpressionHold?: boolean;
  idleExpressionDelayMs?: number;
}) {
  const storeRef = useRef<FundyStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createFundyStore(
      initialAnimation,
      idleExpression,
      idleExpressionHold,
      idleExpressionDelayMs,
    );
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
