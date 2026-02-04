import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useBattleStartCountdown } from '../useBattleStartCountdown';

describe('useBattleStartCountdown', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('활성화 시 3-2-1-시작 순서로 라벨이 변경된다', () => {
    vi.useFakeTimers();
    const baseTime = new Date('2024-01-01T00:00:00.000Z');
    vi.setSystemTime(baseTime);

    const endsAt = baseTime.getTime() + 4000;
    const { result } = renderHook(() => useBattleStartCountdown({ endsAt, intervalMs: 1000 }));

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

  it('카운트다운 진행 중 들어오면 현재 라벨을 계산한다', () => {
    vi.useFakeTimers();
    const baseTime = new Date('2024-01-01T00:00:00.000Z');
    vi.setSystemTime(baseTime);

    const endsAt = baseTime.getTime() + 4000;
    vi.advanceTimersByTime(2500);

    const { result } = renderHook(() => useBattleStartCountdown({ endsAt, intervalMs: 1000 }));

    expect(result.current.isVisible).toBe(true);
    expect(result.current.label).toBe('1');
  });
});
