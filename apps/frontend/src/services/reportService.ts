import { apiFetch } from './api';

interface ReportRequest {
  report_description: string;
}

interface ReportResponse {
  id: number;
  quizId: number;
  report_description: string;
  createdAt: string;
}

export const reportService = {
  /**
   * 퀴즈 신고 제출
   * @param quizId 퀴즈 ID
   * @param data 신고 요청 데이터
   * @returns 신고 성공 여부
   */
  createReport: async (quizId: number, data: ReportRequest): Promise<ReportResponse> =>
    apiFetch.post<ReportResponse>(`/quizzes/${quizId}/reports`, data),
};
