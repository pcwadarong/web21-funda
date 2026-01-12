// 에러 응답 포맷 (백엔드에서 에러 발생 시 반환되는 구조)
export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  error?: string;
}
