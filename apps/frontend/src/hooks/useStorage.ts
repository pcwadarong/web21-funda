import { useCallback, useState } from 'react';

import { type Progress, type QuizStorageData, storageUtil, type UIState } from '@/utils/storage';

export const useStorage = () => {
  // 초기 상태를 로컬 스토리지에서 읽어온다.
  const [storageData, setStorageData] = useState<QuizStorageData>(storageUtil.get());

  // 학습 데이터 부분 업데이트
  const updateProgress = useCallback((newProgress: Partial<Progress>) => {
    const updated = storageUtil.update('progress', newProgress);
    setStorageData(updated);
  }, []);

  // UI 상태 부분 업데이트
  const updateUIState = useCallback((newUIState: Partial<UIState>) => {
    const updated = storageUtil.update('ui_state', newUIState);
    setStorageData(updated);
  }, []);
  //  퀴즈 히스토리
  const addStepHistory = useCallback((stepId: number) => {
    const updated = storageUtil.addStepHistory(stepId);
    setStorageData(updated);
  }, []);

  // 특정 필드별 마지막 유닛 업데이트
  const updateLastSolvedUnit = useCallback((fieldSlug: string, unitId: number) => {
    const updated = storageUtil.updateLastSolvedUnit(fieldSlug, unitId);
    setStorageData(updated);
  }, []);
  return {
    storageData,
    progress: storageData.progress,
    uiState: storageData.ui_state,
    solvedStepHistory: storageData.solved_step_history,
    updateProgress,
    updateUIState,
    addStepHistory,
    updateLastSolvedUnit,
  };
};
