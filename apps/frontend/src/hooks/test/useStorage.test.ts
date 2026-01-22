import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useStorage } from '../useStorage';

describe('useStorage Hook', () => {
  // 각 테스트 시작 전에 로컬 스토리지를 비웁니다.
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('초기 렌더링 시 기본 상태(DEFAULT_STATE)를 가져와야 한다', () => {
    const { result } = renderHook(() => useStorage());

    expect(result.current.progress.heart).toBe(5);
    expect(result.current.uiState.last_viewed.field_slug).toBe('FE');
  });

  it('하트 변경후 로컬 스토리지에 저장되어야 한다', () => {
    const { result } = renderHook(() => useStorage());

    act(() => {
      result.current.updateProgress({ heart: 3 });
    });

    expect(result.current.progress.heart).toBe(3);
    // 로컬 스토리지에도 저장되었는지 확인
    const stored = JSON.parse(localStorage.getItem('QUIZ_V1') || '');
    expect(stored.progress.heart).toBe(3);
  });
  it('푼 unit에 대한 정보를 저장시 필드별 유닛 ID를 올바르게 관리해야 한다', () => {
    const { result } = renderHook(() => useStorage());

    act(() => {
      // 1. FE 추가
      result.current.updateLastSolvedUnit('FE', 1);
      // 2. BE 추가
      result.current.updateLastSolvedUnit('BE', 5);
      // 3. FE 업데이트 (기존 값 수정 확인)
      result.current.updateLastSolvedUnit('FE', 2);
    });

    const list = result.current.progress.last_solved_unit_id;
    expect(list).toHaveLength(2); // FE가 2개가 아니라 1개로 유지되어야 함
    expect(list.find(i => i.field_slug === 'FE')?.unit_id).toBe(2);
    expect(list.find(i => i.field_slug === 'BE')?.unit_id).toBe(5);
  });

  it('updateUIState를 호출하면 화면 관리 상태가 업데이트되어야 한다', () => {
    const { result } = renderHook(() => useStorage());

    act(() => {
      result.current.updateUIState({
        last_viewed: { field_slug: 'BE', unit_id: 10 },
      });
    });

    expect(result.current.uiState.last_viewed.field_slug).toBe('BE');
    expect(result.current.uiState.last_viewed.unit_id).toBe(10);
  });

  it('UI 상태와 히스토리가 독립적으로 잘 유지되는지 확인한다', () => {
    const { result } = renderHook(() => useStorage());

    act(() => {
      result.current.updateUIState({ current_quiz_step_id: 8 });
      result.current.addStepHistory(8); // 현재 풀고 있는 번호를 히스토리에 추가
    });

    expect(result.current.uiState.current_quiz_step_id).toBe(8);
    expect(result.current.solvedStepHistory).toContain(8);
  });
});
