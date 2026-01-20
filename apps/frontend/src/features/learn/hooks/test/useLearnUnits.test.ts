import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { UnitsResponse } from '@/services/fieldService';

const mockUseStorage = vi.fn();
const updateUIStateMock = vi.fn();
const mockStorageUtilGet = vi.fn();
let storageState: {
  uiState: {
    last_viewed: { field_slug: string; unit_id: number };
    current_quiz_step_id: number;
  };
  solvedStepHistory: number[];
};

vi.mock('@/hooks/useStorage', () => ({
  useStorage: () => mockUseStorage(),
}));

vi.mock('@/utils/storage', () => ({
  storageUtil: {
    get: () => mockStorageUtilGet(),
  },
}));

const createUnitsResponse = (overrides?: Partial<UnitsResponse>): UnitsResponse => ({
  field: { name: '프론트엔드', slug: 'FE' },
  units: [
    {
      id: 1,
      title: '유닛 1',
      orderIndex: 1,
      steps: [
        {
          id: 1,
          title: '스텝 1',
          orderIndex: 1,
          quizCount: 3,
          isCheckpoint: false,
          isCompleted: false,
          isLocked: false,
        },
        {
          id: 2,
          title: '스텝 2',
          orderIndex: 2,
          quizCount: 3,
          isCheckpoint: false,
          isCompleted: false,
          isLocked: false,
        },
      ],
    },
  ],
  ...overrides,
});

describe('useLearnUnits Hook', () => {
  beforeEach(() => {
    storageState = {
      uiState: {
        last_viewed: { field_slug: 'FE', unit_id: 1 },
        current_quiz_step_id: 0,
      },
      solvedStepHistory: [2],
    };
    mockUseStorage.mockImplementation(() => ({
      ...storageState,
      updateUIState: updateUIStateMock,
    }));
    mockStorageUtilGet.mockImplementation(() => ({ ui_state: storageState.uiState }));
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    updateUIStateMock.mockClear();
    vi.unstubAllGlobals();
  });

  it('유닛을 불러왔을 때, 비로그인 이력의 완료 상태가 반영되어야 한다', async () => {
    const { useLearnUnits } = await import('../useLearnUnits');
    const { result } = renderHook(() => useLearnUnits());

    const processedUnits = result.current.markSolvedSteps(createUnitsResponse().units);

    const completedStep = processedUnits[0]!.steps.find(step => step.id === 2);
    expect(completedStep?.isCompleted).toBe(true);
  });

  it('유닛을 불러왔을 때, 로그인 상태에서는 완료 상태를 덮어쓰지 않아야 한다', async () => {
    const { useLearnUnits } = await import('../useLearnUnits');
    renderHook(() => useLearnUnits());

    const completedStep = createUnitsResponse().units[0]!.steps.find(step => step.id === 2);
    expect(completedStep?.isCompleted).toBe(false);
  });

  it('유닛을 불러왔을 때, 활성 유닛이 첫 번째 유닛이어야 한다', async () => {
    const { useLearnUnits } = await import('../useLearnUnits');
    const { result } = renderHook(() => useLearnUnits());

    act(() => {
      result.current.setUnits(createUnitsResponse().units);
    });

    expect(result.current.activeUnit?.id).toBe(1);
  });

  it('유닛을 불러왔을 때, 필드 이름이 상태로 설정되어야 한다', async () => {
    const { useLearnUnits } = await import('../useLearnUnits');
    const { result } = renderHook(() => useLearnUnits());

    act(() => {
      result.current.setFieldName('프론트엔드');
    });

    expect(result.current.fieldName).toBe('프론트엔드');
  });

  it('스크롤이 발생했을 때, 활성 유닛이 스크롤 위치에 맞게 변경되어야 한다', async () => {
    const { useLearnUnits } = await import('../useLearnUnits');
    const { result } = renderHook(() => useLearnUnits());

    const container = document.createElement('div');
    const header = document.createElement('div');
    Object.defineProperty(header, 'offsetHeight', { value: 20 });

    const unit1 = document.createElement('div');
    const unit2 = document.createElement('div');
    Object.defineProperty(unit1, 'offsetTop', { value: 0 });
    Object.defineProperty(unit2, 'offsetTop', { value: 500 });

    act(() => {
      result.current.scrollContainerRef.current = container;
      result.current.headerRef.current = header;
      result.current.registerUnitRef(1)(unit1);
      result.current.registerUnitRef(2)(unit2);
    });

    act(() => {
      result.current.setUnits(
        createUnitsResponse({
          units: [
            {
              id: 1,
              title: '유닛 1',
              orderIndex: 1,
              steps: [],
            },
            {
              id: 2,
              title: '유닛 2',
              orderIndex: 2,
              steps: [],
            },
          ],
        }).units,
      );
    });

    await waitFor(() => {
      expect(result.current.units.length).toBe(2);
    });

    await act(async () => {
      container.scrollTop = 600;
      container.dispatchEvent(new Event('scroll'));
    });

    await waitFor(() => {
      expect(result.current.activeUnit?.id).toBe(2);
    });
  });

  it('저장된 유닛이 있을 때, 해당 위치로 스크롤되어야 한다', async () => {
    storageState = {
      uiState: {
        last_viewed: { field_slug: 'FE', unit_id: 2 },
        current_quiz_step_id: 0,
      },
      solvedStepHistory: [],
    };

    const { useLearnUnits } = await import('../useLearnUnits');
    const { result } = renderHook(() => useLearnUnits());

    const container = document.createElement('div');
    const header = document.createElement('div');
    Object.defineProperty(header, 'offsetHeight', { value: 10 });

    const unit2 = document.createElement('div');
    Object.defineProperty(unit2, 'offsetTop', { value: 300 });

    const scrollToMock = vi.fn();
    container.scrollTo = scrollToMock;

    act(() => {
      result.current.scrollContainerRef.current = container;
      result.current.headerRef.current = header;
      result.current.registerUnitRef(2)(unit2);
    });

    act(() => {
      result.current.setUnits(
        createUnitsResponse({
          units: [
            {
              id: 1,
              title: '유닛 1',
              orderIndex: 1,
              steps: [],
            },
            {
              id: 2,
              title: '유닛 2',
              orderIndex: 2,
              steps: [],
            },
          ],
        }).units,
      );
    });

    await waitFor(() => {
      expect(result.current.units.length).toBe(2);
    });

    await waitFor(() => {
      expect(scrollToMock).toHaveBeenCalledWith({ top: 290 });
    });
  });

  it('저장된 유닛이 1 이하일 때는 스크롤되지 않아야 한다', async () => {
    storageState = {
      uiState: {
        last_viewed: { field_slug: 'FE', unit_id: 1 },
        current_quiz_step_id: 0,
      },
      solvedStepHistory: [],
    };

    const { useLearnUnits } = await import('../useLearnUnits');
    const { result } = renderHook(() => useLearnUnits());

    const container = document.createElement('div');
    const header = document.createElement('div');
    Object.defineProperty(header, 'offsetHeight', { value: 10 });

    const unit1 = document.createElement('div');
    Object.defineProperty(unit1, 'offsetTop', { value: 200 });

    const scrollToMock = vi.fn();
    container.scrollTo = scrollToMock;

    act(() => {
      result.current.scrollContainerRef.current = container;
      result.current.headerRef.current = header;
      result.current.registerUnitRef(1)(unit1);
    });

    act(() => {
      result.current.setUnits(
        createUnitsResponse({
          units: [
            {
              id: 1,
              title: '유닛 1',
              orderIndex: 1,
              steps: [],
            },
            {
              id: 2,
              title: '유닛 2',
              orderIndex: 2,
              steps: [],
            },
          ],
        }).units,
      );
    });

    await waitFor(() => {
      expect(result.current.units.length).toBe(2);
    });

    expect(scrollToMock).not.toHaveBeenCalled();
  });

  it('last_viewed.unit_id가 변경되면 해당 위치로 다시 스크롤되어야 한다', async () => {
    const { useLearnUnits } = await import('../useLearnUnits');
    const { result } = renderHook(() => useLearnUnits());

    const container = document.createElement('div');
    const header = document.createElement('div');
    Object.defineProperty(header, 'offsetHeight', { value: 10 });

    const unit2 = document.createElement('div');
    Object.defineProperty(unit2, 'offsetTop', { value: 400 });

    const scrollToMock = vi.fn();
    container.scrollTo = scrollToMock;

    act(() => {
      result.current.scrollContainerRef.current = container;
      result.current.headerRef.current = header;
      result.current.registerUnitRef(2)(unit2);
    });

    act(() => {
      result.current.setUnits(
        createUnitsResponse({
          units: [
            {
              id: 1,
              title: '유닛 1',
              orderIndex: 1,
              steps: [],
            },
            {
              id: 2,
              title: '유닛 2',
              orderIndex: 2,
              steps: [],
            },
          ],
        }).units,
      );
    });

    await waitFor(() => {
      expect(result.current.units.length).toBe(2);
    });

    storageState = {
      ...storageState,
      uiState: {
        ...storageState.uiState,
        last_viewed: { field_slug: 'BE', unit_id: 2 },
      },
    };

    await act(async () => {
      result.current.setFieldSlug('BE');
    });

    await waitFor(() => {
      expect(scrollToMock).toHaveBeenCalledWith({ top: 390 });
    });
  });

  it('체크포인트 이전 스텝이 모두 완료되었을 때, 체크포인트가 잠금 해제되어야 한다', async () => {
    const { useLearnUnits } = await import('../useLearnUnits');
    const { result } = renderHook(() => useLearnUnits());

    const processedUnits = result.current.unlockCheckpoints(
      createUnitsResponse({
        units: [
          {
            id: 1,
            title: '유닛 1',
            orderIndex: 1,
            steps: [
              {
                id: 1,
                title: '스텝 1',
                orderIndex: 1,
                quizCount: 3,
                isCheckpoint: false,
                isCompleted: true,
                isLocked: false,
              },
              {
                id: 2,
                title: '체크포인트',
                orderIndex: 2,
                quizCount: 3,
                isCheckpoint: true,
                isCompleted: false,
                isLocked: true,
              },
            ],
          },
        ],
      }).units,
    );

    const checkpointStep = processedUnits[0]!.steps.find(step => step.id === 2);
    expect(checkpointStep?.isLocked).toBe(false);
  });
});
