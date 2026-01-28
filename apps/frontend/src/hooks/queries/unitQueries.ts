import { useQuery } from '@tanstack/react-query';

import type { UnitOverviewResponse } from '@/services/unitService';
import { unitService } from '@/services/unitService';

export const unitKeys = {
  overview: (unitId: number) => ['unit', unitId, 'overview'] as const,
};

export const useUnitOverview = (unitId: number | null) =>
  useQuery<UnitOverviewResponse, Error>({
    queryKey: unitId ? unitKeys.overview(unitId) : ['unit', 'overview', 'empty'],
    queryFn: () => {
      if (unitId === null) {
        throw new Error('unitId가 없습니다.');
      }
      return unitService.getUnitOverview(unitId);
    },
    enabled: unitId !== null,
    staleTime: 0,
  });
