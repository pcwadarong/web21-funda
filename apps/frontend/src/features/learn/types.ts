export type LessonType = 'normal' | 'checkpoint';

export interface stepType {
  id: number;
  title: string;
  orderIndex: number;
  quizCount: number;
  isCheckpoint: boolean;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface UnitType {
  id: number;
  title: string;
  orderIndex: number;
  steps: readonly stepType[];
}

export interface UnitsResponse {
  field: {
    name: string;
    slug: string;
  };
  units: readonly UnitType[];
}
