import type { IconMapTypes } from '@/constants/icons';
import type { RoadmapUnit } from '@/feat/roadmap/types';

import { apiFetch } from './api';

export interface Field {
  slug: string;
  name: string;
  description: string;
  icon: IconMapTypes;
}

export interface FieldsResponse {
  fields: Field[];
}

export interface UnitsResponse {
  field: {
    name: string;
    slug: string;
  };
  units: Array<{
    id: number;
    title: string;
    orderIndex: number;
    steps: Array<{
      id: number;
      title: string;
      orderIndex: number;
      quizCount: number;
      isCheckpoint: boolean;
      isCompleted: boolean;
      isLocked: boolean;
    }>;
  }>;
}

export interface RoadmapResponse {
  field: {
    name: string;
  };
  units: RoadmapUnit[];
}

export interface FirstUnitResponse {
  field: {
    name: string;
    slug: string;
  };
  unit: {
    id: number;
    title: string;
    orderIndex: number;
    steps: Array<{
      id: number;
      title: string;
      orderIndex: number;
      quizCount: number;
      isCheckpoint: boolean;
      isCompleted: boolean;
      isLocked: boolean;
    }>;
  } | null;
}

export const fieldService = {
  /**
   * 모든 필드 목록을 가져옵니다.
   */
  async getFields(): Promise<FieldsResponse> {
    return apiFetch.get<FieldsResponse>('/fields');
  },

  /**
   * 특정 필드의 유닛 목록을 가져옵니다.
   * @param fieldSlug 필드 슬러그
   */
  async getFieldUnits(fieldSlug: string): Promise<UnitsResponse> {
    return apiFetch.get<UnitsResponse>(`/fields/${fieldSlug}/units`);
  },

  /**
   * 특정 필드의 로드맵 데이터를 가져옵니다.
   * @param fieldSlug 필드 슬러그
   */
  async getFieldRoadmap(fieldSlug: string): Promise<RoadmapResponse> {
    return apiFetch.get<RoadmapResponse>(`/fields/${fieldSlug}/roadmap`);
  },

  /**
   * 특정 필드의 첫 번째 유닛과 스텝 정보를 가져옵니다.
   * @param fieldSlug 필드 슬러그
   */
  async getFirstUnit(fieldSlug: string): Promise<FirstUnitResponse> {
    return apiFetch.get<FirstUnitResponse>(`/fields/${fieldSlug}/units/first`);
  },
};
