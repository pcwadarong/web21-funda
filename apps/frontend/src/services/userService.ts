import { apiFetch } from './api';

interface UnsubscribeRequest {
  email: string;
  token: string;
}

interface UnsubscribeResponse {
  success: boolean;
  message: string;
}

export const notificationService = {
  /**
   * 이메일 수신 거부 요청
   * @param data 수신 거부할 이메일 정보
   * @returns 처리 결과 메시지
   */
  unsubscribe: async (data: UnsubscribeRequest): Promise<UnsubscribeResponse> =>
    apiFetch.patch<UnsubscribeResponse>('/notification/unsubscribe', data),
};
