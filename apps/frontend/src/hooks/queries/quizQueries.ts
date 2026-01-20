import { useMutation, useSuspenseQuery } from '@tanstack/react-query';

import type { QuizSubmissionRequest, StepCompletionPayload } from '@/services/quizService';
import { quizService } from '@/services/quizService';

export const useQuizzesByStepQuery = (stepId?: number) =>
  useSuspenseQuery({
    queryKey: ['quizzes-by-step', stepId],
    queryFn: () => quizService.getQuizzesByStep(stepId as number),
  });

export const useSubmitQuizMutation = () =>
  useMutation({
    mutationFn: ({ quizId, payload }: { quizId: number; payload: QuizSubmissionRequest }) =>
      quizService.submitQuiz(quizId, payload),
  });

export const useCompleteStepMutation = () =>
  useMutation({
    mutationFn: ({ stepId, payload }: { stepId: number; payload: StepCompletionPayload }) =>
      quizService.completeStep(stepId, payload),
  });

export const useStartStepMutation = () =>
  useMutation({
    mutationFn: (stepId: number) => quizService.startStep(stepId),
  });
