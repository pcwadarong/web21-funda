import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { LearnContainer } from '@/feat/learn/components/LearnContainer';
import { useLearnUnits } from '@/feat/learn/hooks/useLearnUnits';
import type { stepType } from '@/feat/learn/types';
import { useFieldUnitsQuery } from '@/hooks/queries/fieldQueries';
import { useStorage } from '@/hooks/useStorage';
import { shuffleQuizOptions } from '@/pages/quiz/utils/shuffleQuizOptions';
import { quizService } from '@/services/quizService';
import { useIsLoggedIn } from '@/store/authStore';
import { useToast } from '@/store/toastStore';
import { shuffleArray } from '@/utils/shuffleArray';
import { storageUtil } from '@/utils/storage';

export const Learn = () => {
  const { showToast } = useToast();
  const { updateUIState } = useStorage();
  const navigate = useNavigate();
  const {
    fieldName,
    setFieldName,
    units,
    setUnits,
    activeUnit,
    setActiveUnitId,
    scrollContainerRef,
    headerRef,
    registerUnitRef,
    fieldSlug,
    setFieldSlug,
    markSolvedSteps,
    unlockCheckpoints,
  } = useLearnUnits();

  const showInProgressToast = useCallback(() => {
    showToast('제작 중입니다');
  }, []);

  const isLoggedIn = useIsLoggedIn();

  const { data } = useFieldUnitsQuery(fieldSlug);

  /**
   * field_slug를 기준으로 유닛/스텝 데이터를 요청하고 상태로 매핑합니다.
   */
  useEffect(() => {
    setFieldName(data.field.name);
    setUnits(
      isLoggedIn
        ? unlockCheckpoints(data.units ?? [])
        : unlockCheckpoints(markSolvedSteps(data.units ?? [])),
    );
    setActiveUnitId(data.units[0]?.id ?? null);
  }, [data, isLoggedIn]);

  const prefetchedStepsRef = useRef<number[]>([]);
  const MAX_PREFETCH = 3;
  const handleStepHover = async (stepId: number) => {
    // 이미 프리페치된 경우 스킵
    if (prefetchedStepsRef.current.includes(stepId)) {
      return;
    }
    // 3개를 초과하면 가장 오래된 것(첫 번째) 제거
    if (prefetchedStepsRef.current.length >= MAX_PREFETCH) {
      const oldestStepId = prefetchedStepsRef.current.shift();
      if (oldestStepId !== undefined) {
        sessionStorage.removeItem(`processed_quizzes_${oldestStepId}`);
      }
    }
    // 새로운 stepId 추가
    prefetchedStepsRef.current.push(stepId);
    // 데이터 프리페치
    try {
      const data = await quizService.getQuizzesByStep(stepId);
      const shuffledQuizzes = await shuffleArray(data);
      const finalQuizzes = await shuffleQuizOptions(shuffledQuizzes);

      const processedData = {
        quizzes: finalQuizzes,
        selectedAnswers: new Array(finalQuizzes.length).fill(null),
        questionStatuses: new Array(finalQuizzes.length).fill('idle'),
        quizSolutions: new Array(finalQuizzes.length).fill(null),
      };

      sessionStorage.setItem(`processed_quizzes_${stepId}`, JSON.stringify(processedData));
    } catch (_error) {
      prefetchedStepsRef.current = prefetchedStepsRef.current.filter(id => id !== stepId);
    }
  };

  const handleStepClick = useCallback(
    (step: stepType) => {
      const stepTitle = step.title;
      const isInProgressStep = stepTitle === '제작 중';

      if (units.length === 0) return;
      const fallbackUnitId = units[0]?.id;
      if (!fallbackUnitId) return;
      const currentUnit = units.find(unit => unit.steps.some(s => s.id === step.id))?.id;

      // 제작 중 스텝은 토스트 메시지 출력
      if (isInProgressStep) {
        showInProgressToast();
        return;
      }

      // 중간 점검 클릭시 제작중입니다 토스트 메시지 출력 (임시)
      if (step.isCheckpoint) {
        showInProgressToast();
        return;
      }

      updateUIState({
        current_quiz_step_id: step.id,
        last_viewed: {
          field_slug: storageUtil.get().ui_state.last_viewed.field_slug,
          unit_id: currentUnit ?? fallbackUnitId,
        },
      });

      navigate('/quiz');
    },
    [navigate, showInProgressToast, updateUIState, units],
  );

  return (
    <>
      <LearnContainer
        fieldName={fieldName}
        units={units}
        activeUnit={activeUnit}
        scrollContainerRef={scrollContainerRef}
        headerRef={headerRef}
        registerUnitRef={registerUnitRef}
        onStepClick={handleStepClick}
        onStepHover={handleStepHover}
        fieldSlug={fieldSlug}
        setFieldSlug={setFieldSlug}
      />
    </>
  );
};
