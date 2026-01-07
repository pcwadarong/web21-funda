export type QuestionStatus = 'idle' | 'checking' | 'checked';

export interface MultipleChoiceQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  code?: string;
  explanation?: string;
}
