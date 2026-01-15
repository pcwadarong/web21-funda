import { useCallback, useState } from 'react';

import {
  type GuestAnswer,
  type GuestStepAttempt,
  type Progress,
  type QuizStorageData,
  storageUtil,
  type UIState,
} from '@/utils/storage';

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

  // 퀴즈 시작 시간 설정
  const setQuizStartedAt = useCallback((stepId: number, timestamp?: number) => {
    const updated = storageUtil.setQuizStartedAt(stepId, timestamp);
    setStorageData(updated);
  }, []);

  // 퀴즈 시작 시간 가져오기
  const getQuizStartedAt = useCallback(
    (stepId: number) => storageUtil.getQuizStartedAt(stepId),
    [],
  );

  // 게스트 스텝 시작 기록
  const startGuestStepAttempt = useCallback((stepId: number, timestamp?: number) => {
    const updated = storageUtil.startGuestStepAttempt(stepId, timestamp);
    setStorageData(updated);
  }, []);

  // 게스트 정답 기록
  const addGuestStepAnswer = useCallback((stepId: number, answer: GuestAnswer) => {
    const updated = storageUtil.addGuestStepAnswer(stepId, answer);
    setStorageData(updated);
  }, []);

  // 게스트 스텝 종료 기록
  const finalizeGuestStepAttempt = useCallback((stepId: number, timestamp?: number) => {
    const updated = storageUtil.finalizeGuestStepAttempt(stepId, timestamp);
    setStorageData(updated);
  }, []);

  // 게스트 스텝 기록 조회
  const getGuestStepAttempt = useCallback(
    (stepId: number): GuestStepAttempt | null => storageUtil.getGuestStepAttempt(stepId),
    [],
  );

  // 게스트 스텝 기록 삭제
  const removeGuestStepAttempt = useCallback((stepId: number) => {
    const updated = storageUtil.removeGuestStepAttempt(stepId);
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
    setQuizStartedAt,
    getQuizStartedAt,
    startGuestStepAttempt,
    addGuestStepAnswer,
    finalizeGuestStepAttempt,
    getGuestStepAttempt,
    removeGuestStepAttempt,
  };
};
