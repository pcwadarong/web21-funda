import { useRef } from 'react';
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

  const prefetchedStepsRef = useRef<number[]>([]);
  const MAX_PREFETCH = 3;
  const handleStepHover = (stepId: number) => {
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
