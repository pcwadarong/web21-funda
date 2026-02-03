import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { RoadmapContainer } from '@/feat/roadmap/components/RoadmapContainer';
import type { RoadmapUnit } from '@/feat/roadmap/types';
import { useFieldRoadmapQuery } from '@/hooks/queries/fieldQueries';
import { useStorage } from '@/hooks/useStorage';
import { useIsLoggedIn } from '@/store/authStore';

/**
 * 로드맵 페이지
 * API 호출만 담당하고 UI는 RoadmapContainer에 위임합니다.
 */
export const Roadmap = () => {
  const navigate = useNavigate();
  const { updateUIState, uiState } = useStorage();

  const fieldSlug = uiState.last_viewed?.field_slug;

  const isLoggedIn = useIsLoggedIn();

  const { data } = useFieldRoadmapQuery(fieldSlug);

  const units = useMemo<RoadmapUnit[]>(() => {
    if (!data) return [];
    return isLoggedIn
      ? data.units.map(unit => {
          const isInProgress = unit.progress > 0 && unit.progress < 100;
          const isCompleted = unit.progress === 100;
          return {
            ...unit,
            status: isInProgress ? 'active' : isCompleted ? 'completed' : 'normal',
            variant: isInProgress ? 'full' : 'compact',
          };
        })
      : data.units;
  }, [data, isLoggedIn]);

  const field = data?.field.name;

  /**
   * 유닛 카드 클릭 처리
   * @param unitId 선택한 유닛 ID
   */
  const handleClick = (unitId: number) => {
    updateUIState({
      last_viewed: {
        ...uiState.last_viewed,
        unit_id: unitId,
      },
    });
    navigate('/learn');
  };

  return <RoadmapContainer fieldName={field} units={units} onUnitClick={handleClick} />;
};
