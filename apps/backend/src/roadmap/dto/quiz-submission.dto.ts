export interface MatchingPair {
  left: string;
  right: string;
}

export interface QuizSubmissionRequest {
  quiz_id: number;
  type: string;
  selection: {
    option_id?: string;
    pairs?: MatchingPair[];
  };
  /**
   * 사용자가 "잘 모르겠어요"로 제출한 경우 true
   */
  is_dont_know?: boolean;
  /**
   * 인증 사용자가 스텝 시작 시 받은 stepAttemptId.
   * 비로그인 사용자는 포함하지 않는다.
   */
  step_attempt_id?: number;
  /**
   * 현재 풀고 있는 스텝의 orderIndex.
   * 하트 차감 조건 확인에 사용된다.
   */
  current_step_order_index?: number;
}

export interface QuizSubmissionResponse {
  quiz_id: number;
  is_correct: boolean;
  solution: {
    correct_option_id?: string;
    correct_pairs?: MatchingPair[];
    explanation?: string | null;
  };
  user_heart_count?: number;
}
