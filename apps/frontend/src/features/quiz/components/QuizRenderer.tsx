import { QuizCode } from '@/feat/quiz/components/quizType/QuizCode';
import { QuizMatching } from '@/feat/quiz/components/quizType/QuizMatching';
import { QuizMCQ } from '@/feat/quiz/components/quizType/QuizMCQ';
import { QuizOX } from '@/feat/quiz/components/quizType/QuizOX';
import type {
  AnswerType,
  CorrectAnswerType,
  QuizComponentProps,
  QuizQuestion,
  QuizType,
} from '@/feat/quiz/types';

interface QuizRendererProps {
  question: QuizQuestion;
  selectedAnswer: AnswerType | null;
  correctAnswer: CorrectAnswerType | null;
  onAnswerChange: (answer: AnswerType) => void;
  showResult: boolean;
  disabled: boolean;
}

const QUIZ_MAP: Record<QuizType, React.ComponentType<QuizComponentProps>> = {
  mcq: QuizMCQ as React.ComponentType<QuizComponentProps>,
  ox: QuizOX as React.ComponentType<QuizComponentProps>,
  code: QuizCode as React.ComponentType<QuizComponentProps>,
  matching: QuizMatching as React.ComponentType<QuizComponentProps>,
};

export const QuizRenderer = ({ question, ...props }: QuizRendererProps) => {
  const Component = QUIZ_MAP[question.type];

  if (!Component) return <div>지원하지 않는 퀴즈 유형입니다: {question.type}</div>;

  return <Component content={question.content} {...props} />;
};
