import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RoadmapContainer } from '@/feat/roadmap/components/RoadmapContainer';
import type { RoadmapUnit } from '@/feat/roadmap/types';
import { useStorage } from '@/hooks/useStorage';
import { fieldService } from '@/services/fieldService';
import { useAuthStore } from '@/store/authStore';

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

  const isLoggedIn = useAuthStore(state => state.isLoggedIn);

  useEffect(() => {
    const fetchFields = async () => {
      if (!fieldSlug) return;
      try {
        const data = await fieldService.getFieldRoadmap(fieldSlug);
        setUnits(data.units);
        setField(data.field.name);
      } catch (error) {
        console.error('Failed to fetch fields:', error);
      }
    };

    fetchFields();
  }, [fieldSlug]);

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
