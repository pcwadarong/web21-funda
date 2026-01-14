import type { QuizQuestion } from '@/feat/quiz/types';
import { shuffleArray } from '@/utils/shuffleArray';

export const shuffleQuizOptions = async (quizzes: QuizQuestion[]): Promise<QuizQuestion[]> =>
  new Promise(resolve => {
    setTimeout(async () => {
      const result = await Promise.all(
        quizzes.map(async quiz => {
          const shuffledQuiz = { ...quiz };
          const shuffledContent = { ...quiz.content };

          if (quiz.type === 'matching' && 'matching_metadata' in shuffledContent) {
            shuffledContent.matching_metadata = {
              left: await shuffleArray(shuffledContent.matching_metadata.left),
              right: await shuffleArray(shuffledContent.matching_metadata.right),
            };
          } else if ('options' in shuffledContent) {
            shuffledContent.options = await shuffleArray(shuffledContent.options);
          }

          shuffledQuiz.content = shuffledContent;
          return shuffledQuiz;
        }),
      );
      resolve(result);
    }, 0);
  });
