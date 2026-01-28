export interface UnitOverviewJsonlRow {
  unit_title: string;
  overview: string;
}

export interface UnitOverviewUploadSummary {
  processed: number;
  unitsUpdated: number;
  unitsNotFound: number;
}
