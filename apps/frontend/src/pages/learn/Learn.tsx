import { useNavigate } from 'react-router-dom';

import { LearnContainer } from '@/feat/learn/components/LearnContainer';
import { useLearnUnits } from '@/feat/learn/hooks/useLearnUnits';
import type { QuizQuestion } from '@/feat/quiz/types';
import { useStorage } from '@/hooks/useStorage';
import { shuffleQuizOptions } from '@/pages/quiz/utils/shuffleQuizOptions';
import { shuffleArray } from '@/utils/shuffleArray';

export const Learn = () => {
  const { updateUIState } = useStorage();
  const navigate = useNavigate();
  const { field, units, activeUnit, scrollContainerRef, headerRef, registerUnitRef } =
    useLearnUnits();

  const handleStepHover = (stepId: number) => {
    // 데이터 프리페치
    fetch(`/api/steps/${stepId}/quizzes`)
      .then(res => res.json())
      .then(async (data: QuizQuestion[]) => {
        // 데이터 셔플링
        const shuffledQuizzes = await shuffleArray(data);
        // 옵션 셔플링
        const finalQuizzes = await shuffleQuizOptions(shuffledQuizzes);

        const processedData = {
          quizzes: finalQuizzes,
          selectedAnswers: new Array(finalQuizzes.length).fill(null),
          questionStatuses: new Array(finalQuizzes.length).fill('idle'),
          quizSolutions: new Array(finalQuizzes.length).fill(null),
        };

        sessionStorage.setItem(`processed_quizzes_${stepId}`, JSON.stringify(processedData));
      });
  };

  const handleStepClick = (stepId: number) => {
    navigate('/quiz');
    updateUIState({
      current_quiz_step_id: stepId,
    });
  };

  return (
    <LearnContainer
      field={field}
      units={units}
      activeUnit={activeUnit}
      scrollContainerRef={scrollContainerRef}
      headerRef={headerRef}
      registerUnitRef={registerUnitRef}
      onStepClick={handleStepClick}
      onStepHover={handleStepHover}
    />
  );
};
