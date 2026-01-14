import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Toast } from '@/comp/Toast';
import { LearnContainer } from '@/feat/learn/components/LearnContainer';
import { useLearnUnits } from '@/feat/learn/hooks/useLearnUnits';
import type { stepType } from '@/feat/learn/types';
import { useStorage } from '@/hooks/useStorage';

export const Learn = () => {
  const { updateUIState, uiState } = useStorage();
  const navigate = useNavigate();
  const { field, units, activeUnit, scrollContainerRef, headerRef, registerUnitRef } =
    useLearnUnits();
  const [toastState, setToastState] = useState<{ message: string; issuedAt: number } | null>(null);
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showInProgressToast = useCallback(() => {
    setToastState({
      message: '제작 중입니다',
      // 동일한 문구라도 다시 클릭했을 때 토스트가 재생되도록 시점을 함께 저장한다.
      issuedAt: Date.now(),
    });
  }, []);

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
        
      updateUIState({
        current_quiz_step_id: step.id,
        last_viewed: {
          ...uiState.last_viewed,
          unit_id: currentUnit ?? fallbackUnitId,
        },
      });

      navigate('/quiz');
    },
    [navigate, showInProgressToast, updateUIState, units, uiState.last_viewed],
  );

  const toastIssuedAt = toastState?.issuedAt;

  useEffect(() => {
    if (!toastState) {
      return;
    }

    setIsToastVisible(true);

    const hideTimer = window.setTimeout(() => {
      setIsToastVisible(false);
    }, 2200);

    return () => {
      window.clearTimeout(hideTimer);
    };
  }, [toastIssuedAt, toastState]);

  return (
    <>
      <LearnContainer
        field={field}
        units={units}
        activeUnit={activeUnit}
        scrollContainerRef={scrollContainerRef}
        headerRef={headerRef}
        registerUnitRef={registerUnitRef}
        onStepClick={handleStepClick}
      />
      {toastState && <Toast message={toastState.message} isOpen={isToastVisible} />}
    </>
  );
};
