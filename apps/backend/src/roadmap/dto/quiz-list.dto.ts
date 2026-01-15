export interface QuizOption {
  id: string;
  text: string;
}

export interface CodeMetadata {
  snippet: string;
  language?: string;
}

export interface MatchingMetadata {
  left: Array<{ id: string; text: string }>;
  right: Array<{ id: string; text: string }>;
}

export interface QuizContent {
  question: string;
  options?: QuizOption[];
  code_metadata?: CodeMetadata;
  matching_metadata?: MatchingMetadata;
}

export interface QuizResponse {
  id: number;
  type: string;
  content: QuizContent;
}
