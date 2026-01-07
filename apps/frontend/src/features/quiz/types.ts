/** 퀴즈 유형 */
export type QuizType = 'mcq' | 'ox' | 'matching' | 'code';

/** 문제 풀이 상태 */
export type QuestionStatus = 'idle' | 'checking' | 'checked';

/** 퀴즈 유형별 정답 데이터 타입 정의 */
export type AnswerType = number | number[] | Record<number, number>;

/** -----------------------------------------
 * 퀴즈 문제 구조
 * ----------------------------------------- */

interface BaseQuizContent {
  question: string;
}

/** MCQ, OX */
export interface DefaultContent extends BaseQuizContent {
  choices: string[];
}

/** CODE 전용 */
export interface CodeContent extends BaseQuizContent {
  choices: string[];
  code_metadata: {
    language: string;
    snippet: string;
  };
}

/** MATCHING 전용 */
export interface MatchingContent extends BaseQuizContent {
  matching_metadata: {
    left: string[];
    right: string[];
  };
}

export interface QuizQuestion {
  id: number;
  type: QuizType;
  content: DefaultContent | CodeContent | MatchingContent;
}

/** 각 퀴즈 컴포넌트에서 공통으로 사용하는 매개변수 */
export interface QuizComponentProps {
  content: QuizQuestion['content'];
  selectedAnswer: AnswerType | null;
  onAnswerChange: (answer: AnswerType) => void;
  showResult: boolean;
  disabled: boolean;
}

/** 퀴즈의 옵션 컴포넌트 공통 매개견수 */
export interface QuizOptionProps {
  label?: string;
  option: string;
  isSelected: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

/** 정답 및 해설 구조 */
export interface QuizSolution {
  question_id: number;
  is_correct: boolean;
  solution: {
    explanation: string;
    correct_index?: number; // MCQ, OX, CODE
    correct_pairs?: Record<number, number>; // MATCHING
  };
}
