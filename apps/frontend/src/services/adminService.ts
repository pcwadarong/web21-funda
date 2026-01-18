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

export type UploadResponse =
  | { summary: UploadSummary }
  | { message: string; frontendPath?: string; error?: string }
  | { error: string };

export const adminService = {
  /**
   * JSONL 파일을 업로드하여 퀴즈 데이터를 일괄 업로드합니다.
   * @param file 업로드할 JSONL 파일
   * @returns 업로드 결과 요약 또는 에러 메시지
   */
  async uploadQuizzes(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch.post<UploadResponse>('/admin/quizzes/upload', formData);
  },
};
