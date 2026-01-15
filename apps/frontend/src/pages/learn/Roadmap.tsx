import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RoadmapContainer } from '@/feat/roadmap/components/RoadmapContainer';
import type { RoadmapUnit } from '@/feat/roadmap/types';
import { useStorage } from '@/hooks/useStorage';
import { fieldService } from '@/services/fieldService';
import { useIsLoggedIn } from '@/store/authStore';

/**
 * 로드맵 페이지
 * API 호출만 담당하고 UI는 RoadmapContainer에 위임합니다.
 */
export const Roadmap = () => {
  const navigate = useNavigate();
  const { updateUIState, uiState } = useStorage();

  const fieldSlug = uiState.last_viewed?.field_slug;

  const [field, setField] = useState<string>();
  const [units, setUnits] = useState<RoadmapUnit[]>([]);

  const isLoggedIn = useIsLoggedIn();

  useEffect(() => {
    const fetchFields = async () => {
      if (!fieldSlug) return;
      try {
        const data = await fieldService.getFieldRoadmap(fieldSlug);

        setUnits(
          isLoggedIn
            ? data.units.map(unit => {
                const isInProgress = unit.progress > 0 && unit.progress < 100;
                const isCompleted = unit.progress === 100;

                return {
                  ...unit,
                  status: isInProgress ? 'active' : isCompleted ? 'completed' : 'normal',
                  variant: isInProgress ? 'full' : 'compact',
                };
              })
            : data.units,
        );
        setField(data.field.name);
      } catch (error) {
        console.error('Failed to fetch fields:', error);
      }
    };

    fetchFields();
  }, [fieldSlug, isLoggedIn]);

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

  return (
    <RoadmapContainer
      fieldName={field}
      units={units}
      isLoggedIn={isLoggedIn}
      onUnitClick={handleClick}
    />
  );
};
