export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  result: T;
}

/**
 * 성공 응답의 공통 구조를 만든다.
 *
 * @param {T} result - 실제 응답 데이터
 * @param {number} statusCode - HTTP 상태 코드
 * @returns {ApiResponse<T>} 공통 성공 응답 객체
 */
export function createSuccessResponse<T>(result: T, statusCode: number): ApiResponse<T> {
  return {
    success: true,
    code: statusCode,
    message: '요청이 성공했습니다.',
    result,
  };
}

/**
 * 실패 응답의 공통 구조를 만든다.
 *
 * @param {number} statusCode - HTTP 상태 코드
 * @param {string} message - 오류 메시지
 * @returns {ApiResponse<null>} 공통 실패 응답 객체
 */
export function createErrorResponse(statusCode: number, message: string): ApiResponse<null> {
  return {
    success: false,
    code: statusCode,
    message,
    result: null,
  };
}
