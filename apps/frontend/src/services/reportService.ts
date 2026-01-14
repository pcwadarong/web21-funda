// reportService.ts
import { apiFetch } from './api';

interface ReportRequest {
  report_description: string;
}

interface ReportResponse {
  isSuccess: boolean;
}

export const reportService = {
  /**
   * 퀴즈 신고 제출
   */
  createReport: async (quizId: number, data: ReportRequest): Promise<ReportResponse> =>
    apiFetch.post<ReportResponse>(`/quizzes/${quizId}/reports`, data),
};
