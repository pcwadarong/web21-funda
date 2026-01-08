// 완료된 스텝들을 기록
export interface FieldProgress {
  field_id: number;
  solved_steps: number[];
}
// 학습 진행 데이터
export interface Progress {
  heart: number;
  last_solved_unit_id: number;
  classification: FieldProgress[];
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
    if (!item) return DEFAULT_STATE;

    try {
      return JSON.parse(item);
    } catch (error) {
      // 에러를 로깅
      console.error('파싱 중 오류 발생:', error);

      // 계속 에러가 나오지않게 초기화
      storageUtil.set(DEFAULT_STATE);

      // 서비스가 멈추지 않도록 기본값을 반환
      return DEFAULT_STATE;
    }
  },

  set: (data: QuizStorageData): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      // 용량 초과등 예외 상황 대비
      console.error('로컬 스토리지 저장 중 오류 발생:', error);
    }
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
