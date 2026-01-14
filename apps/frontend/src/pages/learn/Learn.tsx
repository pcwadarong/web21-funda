import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { LearnContainer } from '@/feat/learn/components/LearnContainer';
import { useLearnUnits } from '@/feat/learn/hooks/useLearnUnits';
import { useStorage } from '@/hooks/useStorage';

export const Learn = () => {
  const { updateUIState, uiState } = useStorage();
  const navigate = useNavigate();
  const { field, units, activeUnit, scrollContainerRef, headerRef, registerUnitRef } =
    useLearnUnits();

  const handleStepClick = useCallback(
    (stepId: number) => {
      const currentUnit = units.find(unit => unit.steps.some(step => step.id === stepId))?.id;

      updateUIState({
        current_quiz_step_id: stepId,
        last_viewed: {
          ...uiState.last_viewed,
          unit_id: currentUnit ?? units[0].id,
        },
      });

      navigate('/quiz');
    },
    [navigate, updateUIState, units, uiState.last_viewed],
  );

  return (
    <LearnContainer
      field={field}
      units={units}
      activeUnit={activeUnit}
      scrollContainerRef={scrollContainerRef}
      headerRef={headerRef}
      registerUnitRef={registerUnitRef}
      onStepClick={handleStepClick}
    />
  );
};
