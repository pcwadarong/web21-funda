export interface FieldSummary {
  name: string;
  slug: string;
}

export interface StepSummary {
  id: number;
  title: string;
  orderIndex: number;
  quizCount: number;
  isCheckpoint: boolean;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface UnitWithSteps {
  id: number;
  title: string;
  orderIndex: number;
  steps: StepSummary[];
}

export interface FieldUnitsResponse {
  field: FieldSummary;
  units: UnitWithSteps[];
}
