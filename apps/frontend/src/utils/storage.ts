// 퀴즈 풀이 기록
export interface QuizClassification {
  quiz_id: number;
  is_correct: boolean;
  user_answer: string;
}

// 학습 진행 데이터
export interface Progress {
  heart: number;
  last_solved_unit_id: number;
  classification: QuizClassification[];
}

// 메인 페이지 UI 상태 데이터
export interface UIState {
  last_viewed: {
    field_slug: string;
    unit_id: number;
  };
  current_quiz_step_id: number;
}

// 스토리지 전체 데이터
export interface QuizStorageData {
  progress: Progress;
  ui_state: UIState;
}

const STORAGE_KEY = 'QUIZ_V1';

// 스토리지 기본 값 데이터 설정
const DEFAULT_STATE: QuizStorageData = {
  progress: { heart: 5, last_solved_unit_id: 0, classification: [] },
  ui_state: {
    last_viewed: { field_slug: 'FE', unit_id: 1 },
    current_quiz_step_id: 0,
  },
};

// 사용할 스토리지 함수
export const storageUtil = {
  get: (): QuizStorageData => {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : DEFAULT_STATE;
  },

  set: (data: QuizStorageData): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // key는 progess 또는 ui_state 중 하나만 가능하고 value는 해당 객체의 부분 업데이트를 위한 값
  // partial만 넣어서 사용하도록 제네릭 타입 활용
  update: <K extends keyof QuizStorageData>(
    key: K,
    value: Partial<QuizStorageData[K]>,
  ): QuizStorageData => {
    const current = storageUtil.get();
    const updated = {
      ...current,
      [key]: { ...current[key], ...value },
    };
    storageUtil.set(updated);
    return updated;
  },
};
