import type { StepSummary } from './field-units.dto';

export interface FieldSummary {
  name: string;
  slug: string;
}

export interface UnitSummary {
  id: number;
  title: string;
  orderIndex: number;
  steps: StepSummary[];
}

export interface FirstUnitResponse {
  field: FieldSummary;
  unit: UnitSummary | null;
}
