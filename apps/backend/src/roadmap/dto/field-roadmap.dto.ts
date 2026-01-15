export interface RoadmapUnit {
  id: number;
  title: string;
  orderIndex: number;
  progress: number;
  successRate: number;
}

export interface FieldRoadmapResponse {
  field: {
    name: string;
    slug: string;
  };
  units: RoadmapUnit[];
}
