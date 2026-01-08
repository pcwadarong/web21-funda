import type { AnswerType, QuizComponentProps, QuizQuestion, QuizType } from '../types';

import { QuizCode } from './quizType/QuizCode';
import { QuizMatching } from './quizType/QuizMatching';
import { QuizMCQ } from './quizType/QuizMCQ';
import { QuizOX } from './quizType/QuizOX';

interface QuizRendererProps {
  question: QuizQuestion;
  selectedAnswer: AnswerType | null;
  onAnswerChange: (answer: any) => void;
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
