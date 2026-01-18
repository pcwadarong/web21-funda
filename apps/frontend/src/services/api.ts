export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/** API 표준 응답 포맷 */
interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  result: T;
}

/** 요청 재시도 제어를 위한 옵션 */
type RequestRetryOptions = {
  hasRetried: boolean;
};

/**
 * [인증 갱신] 인증 만료(401) 시 리프레시 토큰 쿠키를 이용하여 세션을 갱신한다.
 * @returns {Promise<boolean>} 갱신 성공 여부
 */
async function tryRefreshToken(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // 쿠키 전달 필수
    });
    return response.ok;
  } catch (error) {
    console.error('[Auth] Token refresh failed:', error);
    return false;
  }
}

/**
 * [공통] API 응답의 유효성을 검사하고 결과를 반환한다.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const responseBody = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  // 1. HTTP 상태 코드가 성공 범위(2xx)가 아닌 경우
  if (!response.ok) {
    const errorMessage = responseBody?.message || `HTTP Error: ${response.status}`;
    throw new Error(errorMessage);
  }

  // 2. 응답 본문이 없거나 success 필드가 false인 경우
  if (!responseBody) throw new Error('응답 본문이 비어 있습니다.');
  if (!responseBody.success) throw new Error(responseBody.message || '요청 처리에 실패했습니다.');

  return responseBody.result;
}

/**
 * [핵심] Fetch API를 기반으로 한 전역 요청 함수.
 * 인증 만료 시 자동 재시도 로직을 포함한다.
 *
 * @param method HTTP 메서드
 * @param endpoint API 엔드포인트 (예: '/users/me')
 * @param body 요청 바디 (POST, PUT 등)
 * @param options 추가적인 Fetch 설정
 * @param retryOptions 내부 재시도 상태 관리용
 */
async function baseRequest<T>(
  method: string,
  endpoint: string,
  body?: unknown,
  options: RequestInit = {},
  retryOptions: RequestRetryOptions = { hasRetried: false },
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 슬래시 중복 방지 처리된 URL 생성
  const url = `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const response = await fetch(url, {
    ...options,
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  // 401 Unauthorized 발생 시 리프레시 토큰으로 재시도
  const isUnauthorized = response.status === 401;
  const isRefreshEndpoint = endpoint.includes('/auth/refresh');

  if (isUnauthorized && !retryOptions.hasRetried && !isRefreshEndpoint) {
    const isRefreshed = await tryRefreshToken();
    if (isRefreshed) return baseRequest(method, endpoint, body, options, { hasRetried: true });
  }

  return handleResponse<T>(response);
}

/**
 * 외부에서 사용할 API 요청 객체
 */
export const apiFetch = {
  get: <T>(url: string, opt?: RequestInit) => baseRequest<T>('GET', url, undefined, opt),

  delete: <T>(url: string, opt?: RequestInit) => baseRequest<T>('DELETE', url, undefined, opt),

  post: <T>(url: string, body?: unknown, opt?: RequestInit) =>
    baseRequest<T>('POST', url, body, opt),

  put: <T>(url: string, body?: unknown, opt?: RequestInit) => baseRequest<T>('PUT', url, body, opt),

  patch: <T>(url: string, body?: unknown, opt?: RequestInit) =>
    baseRequest<T>('PATCH', url, body, opt),
};
