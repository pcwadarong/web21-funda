import type { ApiSuccessResponse } from '@/types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/**
 * 전역 요청 함수 (기본 토대)
 */
async function baseRequest<T>(
  method: string,
  endpoint: string,
  body?: unknown,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // NestJS 에러(4xx, 5xx) 감지기
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  const result: ApiSuccessResponse<T> = await response.json();
  return result.data;
}

/**
 * 커링 패턴을 적용한 apiFetch 객체
 */
export const apiFetch = {
  // 인자가 1개인 메서드 (GET, DELETE)
  get: <T>(url: string, opt?: RequestInit) => baseRequest<T>('GET', url, undefined, opt),
  delete: <T>(url: string, opt?: RequestInit) => baseRequest<T>('DELETE', url, undefined, opt),

  // 인자가 2개인 메서드 (POST, PUT, PATCH)
  post: <T>(url: string, body?: unknown, opt?: RequestInit) =>
    baseRequest<T>('POST', url, body, opt),
  put: <T>(url: string, body?: unknown, opt?: RequestInit) => baseRequest<T>('PUT', url, body, opt),
  patch: <T>(url: string, body?: unknown, opt?: RequestInit) =>
    baseRequest<T>('PATCH', url, body, opt),
};
