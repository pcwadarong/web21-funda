//각 필드 별 마지막으로 푼 유닛
export interface LastSolvedUnit {
  field_slug: string;
  unit_id: number;
}

// 학습 진행 데이터
export interface Progress {
  heart?: number; // Redis에서 동기화된 값 (localStorage에는 저장 안 함)
  last_solved_unit_id: LastSolvedUnit[];
}
export interface StepHistory {
  solved_step_history: number[];
}
// 메인 페이지 UI 상태 데이터
export interface UIState {
  last_viewed: {
    field_slug: string;
    unit_id: number;
  };
  current_quiz_step_id: number;
  current_step_order_index?: number;
}

export interface GuestAnswer {
  quiz_id: number;
  is_correct: boolean;
}

export interface GuestStepAttempt {
  step_id: number;
  started_at: number;
  finished_at?: number;
  answers: GuestAnswer[];
}

export type GuestStepAttempts = Record<number, GuestStepAttempt>;

type StorageUpdatableKey = 'progress' | 'ui_state' | 'quiz_started_at' | 'guest_step_attempts';

// 스토리지 전체 데이터
export interface QuizStorageData {
  progress: Progress;
  ui_state: UIState;
  solved_step_history: number[];
  // step_id별 퀴즈 시작 시간 (step_id: timestamp)
  quiz_started_at: Record<number, number>;
  guest_step_attempts: GuestStepAttempts;
  // 효과음 볼륨 (0.0~1.0)
  sound_volume: number;
}

const STORAGE_KEY = 'QUIZ_V1';

// 스토리지 기본 값 데이터 설정
const DEFAULT_STATE: QuizStorageData = {
  progress: { last_solved_unit_id: [] },
  solved_step_history: [],
  ui_state: {
    last_viewed: { field_slug: 'FE', unit_id: 1 },
    current_quiz_step_id: 0,
  },
  quiz_started_at: {},
  guest_step_attempts: {},
  sound_volume: 1,
};

// 사용할 스토리지 함수
export const storageUtil = {
  get: (): QuizStorageData => {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) return DEFAULT_STATE;

    try {
      const parsed = JSON.parse(item);
      if (!parsed.quiz_started_at) {
        parsed.quiz_started_at = {};
        storageUtil.set(parsed);
      }
      if (!parsed.guest_step_attempts) {
        parsed.guest_step_attempts = {};
        storageUtil.set(parsed);
      }
      if (typeof parsed.sound_volume !== 'number') {
        parsed.sound_volume = DEFAULT_STATE.sound_volume;
        storageUtil.set(parsed);
      }
      return parsed;
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
  update: <K extends StorageUpdatableKey>(
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
  addStepHistory: (stepId: number): QuizStorageData => {
    const current = storageUtil.get();

    // 기존 배열을 Set으로 변환 (중복 제거)
    const historySet = new Set(current.solved_step_history);

    // 새로운 stepId 추가
    historySet.add(stepId);

    // 다시 배열로 변환하여 업데이트
    const updated = {
      ...current,
      solved_step_history: Array.from(historySet),
    };
    storageUtil.set(updated);
    return updated;
  },
  /**
   * 효과음 볼륨을 설정한다.
   *
   * @param volume 0.0~1.0 범위의 볼륨 값
   * @returns 업데이트된 스토리지 데이터
   */
  setSoundVolume: (volume: number): QuizStorageData => {
    const safeVolume = Math.min(Math.max(volume, 0), 1);
    const current = storageUtil.get();
    const updated = {
      ...current,
      sound_volume: safeVolume,
    };
    storageUtil.set(updated);
    return updated;
  },

  /**
   * 효과음 볼륨을 가져온다.
   *
   * @returns 0.0~1.0 범위의 볼륨 값
   */
  getSoundVolume: (): number => {
    const current = storageUtil.get();
    return current.sound_volume;
  },
  /**
   * 특정 필드의 마지막 완료 유닛 업데이트
   * @example storageUtil.updateLastSolvedUnit('FE', 3)
   */
  updateLastSolvedUnit: (fieldSlug: string, unitId: number): QuizStorageData => {
    const current = storageUtil.get();
    const lastSolvedList = [...current.progress.last_solved_unit_id];

    // 1. 해당 필드가 이미 있는지 확인
    const index = lastSolvedList.findIndex(item => item.field_slug === fieldSlug);

    if (index > -1) {
      // 2. 이미 있다면 해당 필드의 unit_id 업데이트
      lastSolvedList[index] = { field_slug: fieldSlug, unit_id: unitId };
    } else {
      // 3. 없다면 새로 추가
      lastSolvedList.push({ field_slug: fieldSlug, unit_id: unitId });
    }

    return storageUtil.update('progress', {
      last_solved_unit_id: lastSolvedList,
    });
  },

  /**
   * 특정 step의 퀴즈 시작 시간 설정 (이미 있으면 업데이트하지 않음)
   * @param stepId step ID
   * @param timestamp 시작 시간 (기본값: 현재 시간)
   * @returns 업데이트된 스토리지 데이터
   */
  setQuizStartedAt: (stepId: number, timestamp?: number): QuizStorageData => {
    const current = storageUtil.get();
    const quizStartedAt = { ...current.quiz_started_at };

    // 이미 시작 시간이 있으면 업데이트하지 않음
    if (quizStartedAt[stepId]) {
      return current;
    }

    // 없으면 현재 시간으로 설정
    quizStartedAt[stepId] = timestamp ?? Date.now();

    return storageUtil.update('quiz_started_at', quizStartedAt);
  },

  /**
   * 특정 step의 퀴즈 시작 시간 가져오기
   * @param stepId step ID
   * @returns 시작 시간 또는 null
   */
  getQuizStartedAt: (stepId: number): number | null => {
    const current = storageUtil.get();
    return current.quiz_started_at[stepId] ?? null;
  },

  /**
   * 비로그인 스텝 풀이 시작 정보를 저장한다.
   *
   * @param stepId 스텝 ID
   * @param timestamp 시작 시각(없으면 현재 시각)
   * @returns 업데이트된 스토리지 데이터
   */
  startGuestStepAttempt: (stepId: number, timestamp?: number): QuizStorageData => {
    const current = storageUtil.get();
    const guestStepAttempts = { ...current.guest_step_attempts };
    const startedAt = timestamp ?? Date.now();

    guestStepAttempts[stepId] = {
      step_id: stepId,
      started_at: startedAt,
      answers: [],
    };

    return storageUtil.update('guest_step_attempts', guestStepAttempts);
  },

  /**
   * 비로그인 스텝 풀이에 퀴즈 정답 결과를 추가한다.
   *
   * @param stepId 스텝 ID
   * @param answer 퀴즈 정답 결과
   * @returns 업데이트된 스토리지 데이터
   */
  addGuestStepAnswer: (stepId: number, answer: GuestAnswer): QuizStorageData => {
    const current = storageUtil.get();
    const guestStepAttempts = { ...current.guest_step_attempts };
    const currentAttempt = guestStepAttempts[stepId] ?? {
      step_id: stepId,
      started_at: Date.now(),
      answers: [],
    };

    const updatedAnswers = currentAttempt.answers.filter(
      savedAnswer => savedAnswer.quiz_id !== answer.quiz_id,
    );

    updatedAnswers.push(answer);

    guestStepAttempts[stepId] = {
      ...currentAttempt,
      answers: updatedAnswers,
    };

    return storageUtil.update('guest_step_attempts', guestStepAttempts);
  },

  /**
   * 비로그인 스텝 풀이 종료 시각을 기록한다.
   *
   * @param stepId 스텝 ID
   * @param timestamp 종료 시각(없으면 현재 시각)
   * @returns 업데이트된 스토리지 데이터
   */
  finalizeGuestStepAttempt: (stepId: number, timestamp?: number): QuizStorageData => {
    const current = storageUtil.get();
    const guestStepAttempts = { ...current.guest_step_attempts };
    const currentAttempt = guestStepAttempts[stepId];

    if (!currentAttempt) {
      return current;
    }

    guestStepAttempts[stepId] = {
      ...currentAttempt,
      finished_at: timestamp ?? Date.now(),
    };

    return storageUtil.update('guest_step_attempts', guestStepAttempts);
  },

  /**
   * 비로그인 스텝 풀이 기록을 가져온다.
   *
   * @param stepId 스텝 ID
   * @returns 스텝 풀이 기록(없으면 null)
   */
  getGuestStepAttempt: (stepId: number): GuestStepAttempt | null => {
    const current = storageUtil.get();
    return current.guest_step_attempts[stepId] ?? null;
  },

  /**
   * 비로그인 스텝 풀이 기록을 삭제한다.
   *
   * @param stepId 스텝 ID
   * @returns 업데이트된 스토리지 데이터
   */
  removeGuestStepAttempt: (stepId: number): QuizStorageData => {
    const current = storageUtil.get();
    const guestStepAttempts = { ...current.guest_step_attempts };

    if (!guestStepAttempts[stepId]) {
      return current;
    }

    delete guestStepAttempts[stepId];

    const updated: QuizStorageData = {
      ...current,
      guest_step_attempts: guestStepAttempts,
    };

    storageUtil.set(updated);
    return updated;
  },
};
