import type { WeeklyRankingResult } from '@/features/leaderboard/types';

import { apiFetch } from './api';

export interface UploadSummary {
  processed: number;
  fieldsCreated: number;
  fieldsUpdated: number;
  unitsCreated: number;
  unitsUpdated: number;
  stepsCreated: number;
  stepsUpdated: number;
  quizzesCreated: number;
  quizzesUpdated: number;
}

export interface UnitOverviewUploadSummary {
  processed: number;
  unitsUpdated: number;
  unitsNotFound: number;
}

export type UploadResponse =
  | { summary: UploadSummary }
  | { message: string; frontendPath?: string; error?: string }
  | { error: string };

export interface AdminWeeklyRankingParams {
  tierName: string;
  groupIndex: number;
  weekKey?: string | null;
}

export const adminService = {
  /**
   * JSONL 파일을 업로드하여 퀴즈 데이터를 일괄 업로드합니다.
   * @param files 업로드할 JSONL 파일 목록
   * @returns 업로드 결과 요약 또는 에러 메시지
   */
  async uploadQuizzes(files: File[]): Promise<UploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('file', file);
    });
    return apiFetch.post<UploadResponse>('/admin/quizzes/upload', formData);
  },

  /**
   * JSONL 파일을 업로드하여 유닛 개요를 일괄 업데이트합니다.
   * @param files 업로드할 JSONL 파일 목록
   * @returns 업로드 결과 요약
   */
  async uploadUnitOverviews(files: File[]): Promise<UnitOverviewUploadSummary> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('file', file);
    });
    return apiFetch.post<UnitOverviewUploadSummary>('/admin/units/overview/upload', formData);
  },

  /**
   * 관리자용 주간 랭킹 정보를 가져옵니다.
   */
  async getWeeklyRankingByGroup(params: AdminWeeklyRankingParams): Promise<WeeklyRankingResult> {
    const query = new URLSearchParams();
    query.set('tierName', params.tierName);
    query.set('groupIndex', String(params.groupIndex));
    if (params.weekKey) {
      query.set('weekKey', params.weekKey);
    }

    return apiFetch.get<WeeklyRankingResult>(`/admin/ranking/weekly?${query.toString()}`);
  },
};
