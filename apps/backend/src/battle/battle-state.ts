export type BattleRoomStatus = 'waiting' | 'in_progress' | 'finished' | 'invalid';

export type BattleTimeLimitType = 'recommended' | 'relaxed' | 'fast';

export type BattleErrorCode =
  | 'ROOM_NOT_FOUND'
  | 'ROOM_NOT_JOINABLE'
  | 'ROOM_FULL'
  | 'NOT_HOST'
  | 'GAME_ALREADY_STARTED'
  | 'GAME_NOT_STARTED'
  | 'INVALID_STATE';

export type BattleValidationResult =
  | { ok: true }
  | { ok: false; code: BattleErrorCode; message: string };

export type BattleRoomSettings = {
  fieldSlug: string;
  maxPlayers: number;
  timeLimitType: BattleTimeLimitType;
  timeLimitSeconds: number;
};

export type BattleParticipant = {
  participantId: string;
  userId: number | null;
  displayName: string;
  score: number;
  isConnected: boolean;
  joinedAt: number;
  leftAt: number | null;
};

export type BattleRoomState = {
  roomId: string;
  hostParticipantId: string;
  status: BattleRoomStatus;
  settings: BattleRoomSettings;
  participants: BattleParticipant[];
  inviteToken: string;
  startedAt: number | null;
  endedAt: number | null;
  currentQuizIndex: number;
  totalQuizzes: number;
  quizIds: number[];
  quizEndsAt: number | null;
};

export type CreateBattleRoomParams = {
  roomId: string;
  hostParticipantId: string;
  settings: BattleRoomSettings;
  inviteToken: string;
  totalQuizzes: number;
};

export type UpdateBattleRoomParams = {
  roomId: string;
  requesterParticipantId: string;
  fieldSlug: string;
  maxPlayers: number;
  timeLimitType: BattleTimeLimitType;
  timeLimitSeconds: number;
};

export type JoinBattleRoomParams = {
  roomId: string;
  participant: BattleParticipant;
};

export type LeaveBattleRoomParams = {
  roomId: string;
  participantId: string;
  now: number;
};

export type StartBattleRoomParams = {
  roomId: string;
  requesterParticipantId: string;
  now: number;
  quizIds: number[];
};

export type FinishBattleRoomParams = {
  roomId: string;
  now: number;
};

export type RestartBattleRoomParams = {
  roomId: string;
  requesterParticipantId: string;
};

/**
 * 방의 초기 상태를 생성한다.
 *
 * @param params 방 생성에 필요한 값
 * @returns 초기 방 상태
 */
export const createBattleRoomState = (params: CreateBattleRoomParams): BattleRoomState => ({
  roomId: params.roomId,
  hostParticipantId: params.hostParticipantId,
  status: 'waiting',
  settings: params.settings,
  participants: [],
  inviteToken: params.inviteToken,
  startedAt: null,
  endedAt: null,
  currentQuizIndex: 0,
  totalQuizzes: params.totalQuizzes,
  quizIds: [],
  quizEndsAt: null,
});

/**
 * 참가 요청 가능 여부를 검증한다.
 *
 * @param state 방 상태
 * @returns 검증 결과
 */
export const validateJoin = (state: BattleRoomState): BattleValidationResult => {
  if (state.status !== 'waiting') {
    return {
      ok: false,
      code: 'ROOM_NOT_JOINABLE',
      message: '게임이 시작되어 참가할 수 없습니다.',
    };
  }

  if (state.participants.length >= state.settings.maxPlayers) {
    return {
      ok: false,
      code: 'ROOM_FULL',
      message: '방 인원이 가득 찼습니다.',
    };
  }

  return { ok: true };
};

/**
 * 방 설정 변경 가능 여부를 검증한다.
 *
 * @param state 방 상태
 * @param requesterParticipantId 요청자 참가자 ID
 * @returns 검증 결과
 */
export const validateUpdateRoom = (
  state: BattleRoomState,
  requesterParticipantId: string,
): BattleValidationResult => {
  if (state.status !== 'waiting') {
    return {
      ok: false,
      code: 'INVALID_STATE',
      message: '현재 상태에서는 요청할 수 없습니다.',
    };
  }

  if (state.hostParticipantId !== requesterParticipantId) {
    return {
      ok: false,
      code: 'NOT_HOST',
      message: '방장만 설정을 변경할 수 있습니다.',
    };
  }

  return { ok: true };
};

/**
 * 게임 시작 가능 여부를 검증한다.
 *
 * @param state 방 상태
 * @param requesterParticipantId 요청자 참가자 ID
 * @returns 검증 결과
 */
export const validateStart = (
  state: BattleRoomState,
  requesterParticipantId: string,
): BattleValidationResult => {
  if (state.status !== 'waiting') {
    return {
      ok: false,
      code: 'GAME_ALREADY_STARTED',
      message: '이미 시작된 게임입니다.',
    };
  }

  if (state.hostParticipantId !== requesterParticipantId) {
    return {
      ok: false,
      code: 'NOT_HOST',
      message: '방장만 게임을 시작할 수 있습니다.',
    };
  }

  if (state.participants.length < 2) {
    return {
      ok: false,
      code: 'INVALID_STATE',
      message: '참가자가 부족합니다.',
    };
  }

  return { ok: true };
};

/**
 * 재시작 가능 여부를 검증한다.
 *
 * @param state 방 상태
 * @returns 검증 결과
 */
export const validateRestart = (state: BattleRoomState): BattleValidationResult => {
  if (state.status !== 'finished' && state.status !== 'invalid') {
    return {
      ok: false,
      code: 'INVALID_STATE',
      message: '현재 상태에서는 요청할 수 없습니다.',
    };
  }

  return { ok: true };
};

/**
 * 방 참가자를 추가한다.
 *
 * @param state 방 상태
 * @param params 참가 정보
 * @returns 변경된 방 상태
 */
export const applyJoin = (
  state: BattleRoomState,
  params: JoinBattleRoomParams,
): BattleRoomState => {
  const nextParticipants = [...state.participants, params.participant];

  return {
    ...state,
    participants: nextParticipants,
  };
};

/**
 * 방 설정을 변경한다.
 *
 * @param state 방 상태
 * @param params 변경 값
 * @returns 변경된 방 상태
 */
export const applyUpdateRoom = (
  state: BattleRoomState,
  params: UpdateBattleRoomParams,
): BattleRoomState => ({
  ...state,
  settings: {
    fieldSlug: params.fieldSlug,
    maxPlayers: params.maxPlayers,
    timeLimitType: params.timeLimitType,
    timeLimitSeconds: params.timeLimitSeconds,
  },
});

/**
 * 참가자를 방에서 제거하고 필요 시 방장을 위임한다.
 *
 * @param state 방 상태
 * @param params 이탈 정보
 * @returns 변경된 방 상태
 */
export const applyLeave = (
  state: BattleRoomState,
  params: LeaveBattleRoomParams,
): BattleRoomState => {
  const nextParticipants = state.participants
    .map((participant: BattleParticipant) => {
      if (participant.participantId !== params.participantId) {
        return participant;
      }

      return {
        ...participant,
        isConnected: false,
        leftAt: params.now,
      };
    })
    .filter((participant: BattleParticipant) => participant.isConnected);

  let nextHostParticipantId = state.hostParticipantId;

  if (state.hostParticipantId === params.participantId && nextParticipants.length > 0) {
    const firstParticipant = nextParticipants[0];
    if (firstParticipant) {
      nextHostParticipantId = firstParticipant.participantId;
    }
  }

  const nextStatus =
    nextParticipants.length < 2 && state.status !== 'finished' && state.status !== 'invalid'
      ? 'invalid'
      : state.status;

  return {
    ...state,
    participants: nextParticipants,
    hostParticipantId: nextHostParticipantId,
    status: nextStatus,
  };
};

/**
 * 게임 시작 상태로 전환한다.
 *
 * @param state 방 상태
 * @param params 시작 정보
 * @returns 변경된 방 상태
 */
export const applyStart = (
  state: BattleRoomState,
  params: StartBattleRoomParams,
): BattleRoomState => ({
  ...state,
  status: 'in_progress',
  startedAt: params.now,
  endedAt: null,
  currentQuizIndex: 0,
  quizIds: params.quizIds,
  quizEndsAt: null,
});

/**
 * 게임 종료 상태로 전환한다.
 *
 * @param state 방 상태
 * @param params 종료 정보
 * @returns 변경된 방 상태
 */
export const applyFinish = (
  state: BattleRoomState,
  params: FinishBattleRoomParams,
): BattleRoomState => ({
  ...state,
  status: 'finished',
  endedAt: params.now,
});

/**
 * 재시작을 위해 상태를 초기화한다.
 *
 * @param state 방 상태
 * @param params 재시작 정보
 * @returns 변경된 방 상태
 */
export const applyRestart = (
  state: BattleRoomState,
  _params: RestartBattleRoomParams,
): BattleRoomState => ({
  ...state,
  status: 'waiting',
  startedAt: null,
  endedAt: null,
  currentQuizIndex: 0,
});
