// Quiz types
export type QuestionStatus = 'idle' | 'checking' | 'checked';

export type LessonType = 'normal' | 'checkpoint';

export interface LessonItem {
  id: string;
  name: string;
  status: 'completed' | 'active' | 'locked';
  type: LessonType;
}

export interface MultipleChoiceQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  code?: string;
  explanation?: string;
}

// Auth types
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

// Field types
export interface StudyField {
  id: string;
  name: string;
  icon: string;
}
