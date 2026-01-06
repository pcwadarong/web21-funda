export type LessonType = 'normal' | 'checkpoint';

export interface LessonItem {
  id: string;
  name: string;
  status: 'completed' | 'active' | 'locked';
  type: LessonType;
}
