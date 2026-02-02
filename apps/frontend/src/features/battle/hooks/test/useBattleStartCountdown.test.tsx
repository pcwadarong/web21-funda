import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useBattleStartCountdown } from '../useBattleStartCountdown';

describe('useBattleStartCountdown', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('활성화 시 3-2-1-시작 순서로 라벨이 변경된다', () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ isActive }) => useBattleStartCountdown({ isActive, intervalMs: 1000 }),
      {
        initialProps: { isActive: false },
      },
    );

    expect(result.current.isVisible).toBe(false);

    rerender({ isActive: true });

    expect(result.current.isVisible).toBe(true);
    expect(result.current.label).toBe('3');

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.label).toBe('2');

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.label).toBe('1');

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.label).toBe('START');

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.isVisible).toBe(false);
  });
});
