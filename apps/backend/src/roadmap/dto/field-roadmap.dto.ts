export interface RoadmapUnit {
  id: number;
  title: string;
  orderIndex: number;
}

export interface FieldRoadmapResponse {
  field: {
    name: string;
    slug: string;
  };
  units: RoadmapUnit[];
}
