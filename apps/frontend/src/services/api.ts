export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  result: T;
}

/**
 * 전역 요청 함수 (기본 토대)
 */
async function baseRequest<T>(
  method: string,
  endpoint: string,
  body?: unknown,
  options: RequestInit = {},
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Authorization 헤더가 명시적으로 제공된 경우에만 사용
  // 그렇지 않으면 백엔드가 쿠키에서 accessToken을 읽음
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // 쿠키를 포함하기 위해 필요
  });

  const responseBody = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok) {
    const errorMessage = responseBody?.message || `API Error: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  if (!responseBody) {
    throw new Error('API 응답 본문이 비어 있습니다.');
  }

  if (!responseBody.success) {
    throw new Error(responseBody.message || '요청에 실패했습니다.');
  }

  return responseBody.result;
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
