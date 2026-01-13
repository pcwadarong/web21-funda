import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { LearnContainer } from '@/feat/learn/components/LearnContainer';
import { useLearnUnits } from '@/feat/learn/hooks/useLearnUnits';
import { useStorage } from '@/hooks/useStorage';

export const Learn = () => {
  const { updateUIState } = useStorage();
  const navigate = useNavigate();
  const { field, units, activeUnit, scrollContainerRef, headerRef, registerUnitRef } =
    useLearnUnits();

  const handleStepClick = useCallback(
    (stepId: number) => {
      navigate('/quiz');
      updateUIState({
        current_quiz_step_id: stepId,
      });
    },
    [navigate, updateUIState],
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
