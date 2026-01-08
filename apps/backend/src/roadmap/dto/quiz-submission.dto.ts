export interface MatchingPair {
  left: string;
  right: string;
}

export interface QuizSubmissionRequest {
  selectedOptionId?: string;
  selectedPairs?: MatchingPair[];
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
