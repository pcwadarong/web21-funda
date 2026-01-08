export interface MatchingPair {
  left: string;
  right: string;
}

export interface QuizSubmissionRequest {
  question_id: number;
  type: string;
  selection: {
    option_id?: string;
    pairs?: MatchingPair[];
  };
}

export interface QuizSubmissionResponse {
  quiz_id: number;
  is_correct: boolean;
  solution: {
    correct_option_id?: string;
    correct_pairs?: MatchingPair[];
    explanation?: string | null;
  };
}
