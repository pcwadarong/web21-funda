const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

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

    const response = await fetch(`${BASE_URL}/admin/quizzes/upload`, {
      method: 'POST',
      body: formData,
    });

    const text = await response.text();
    let parsed: UploadResponse;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { error: text || '응답을 해석할 수 없습니다.' };
    }

    if (!response.ok) {
      const message =
        (parsed as { message?: string }).message ||
        (parsed as { error?: string }).error ||
        '업로드 실패';
      throw new Error(message);
    }

    return parsed;
  },
};
