export interface UnitItem {
  id: number;
  title: string;
  description: string;
}

export type UnitStatus = 'normal' | 'completed' | 'active';
export type UnitVariant = 'full' | 'compact';

export interface RoadmapUnit {
  id: number;
  title: string;
  description: string;
  progress?: number;
  score?: number;
  status?: UnitStatus;
  variant?: UnitVariant;
}
