import { apiFetch } from './api';

interface UnSubscribeRequest {
  email: string;
  token: string;
}

interface UnSubscribeResponse {
  success: boolean;
  message: string;
}

export const notificationService = {
  /**
   * 이메일 수신 거부 요청
   * @param email 수신 거부할 이메일 정보
   * @returns 처리 결과 메시지
   */
  unsubscribe: async (data: UnSubscribeRequest): Promise<UnSubscribeResponse> =>
    apiFetch.patch<UnSubscribeResponse>('/notification/unsubscribe', data),
};
