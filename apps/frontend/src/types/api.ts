// 서버 응답의 공통 포맷
export interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 에러 응답 포맷
export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
}
