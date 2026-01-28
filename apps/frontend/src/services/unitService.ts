import { apiFetch } from './api';

export interface UnitOverviewResponse {
  unit: {
    id: number;
    title: string;
    overview: string | null;
  };
}

export const unitService = {
  /**
   * 유닛 개요를 가져옵니다.
   * @param unitId 유닛 ID
   */
  async getUnitOverview(unitId: number): Promise<UnitOverviewResponse> {
    return apiFetch.get<UnitOverviewResponse>(`/units/${unitId}/overview`);
  },
};
