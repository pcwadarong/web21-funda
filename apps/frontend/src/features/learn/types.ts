export type LessonType = 'normal' | 'checkpoint';

export interface LessonItem {
  id: string;
  name: string;
  status: 'completed' | 'active' | 'locked';
  type: LessonType;
}

export interface LessonSection {
  id: string;
  name: string;
  title: string;
  steps: readonly LessonItem[];
}

export interface UnitsResponse {
  field: {
    name: string;
    slug: string;
  };
  units: Array<{
    id: number;
    title: string;
    orderIndex: number;
    steps: Array<{
      id: number;
      title: string;
      orderIndex: number;
      quizCount: number;
      isCheckpoint: boolean;
      isCompleted: boolean;
      isLocked: boolean;
    }>;
  }>;
}
