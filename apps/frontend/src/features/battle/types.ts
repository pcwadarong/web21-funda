import type { QuizQuestion } from '@/feat/quiz/types';

/**
 * 배틀 방의 현재 상태
 * waiting: 대기실 (설정 변경 가능)
 * countdown: 게임 시작 카운트다운 중
 * in_progress: 퀴즈 푸는 중
 * finished: 게임 종료 (결과 화면)
 * invalid: 인원 부족 등으로 인한 무효 처리
 */
export type BattleRoomStatus = 'waiting' | 'countdown' | 'in_progress' | 'finished' | 'invalid';

/**
 * 제한 시간 난이도 타입
 */
export type BattleTimeLimitType = 'recommended' | 'relaxed' | 'fast';

/**
 * 서버 공통 에러 코드 (거부 응답 규칙 기반)
 */
export type BattleErrorCode =
  | 'ROOM_NOT_FOUND' // 방을 찾을 수 없음
  | 'ROOM_NOT_JOINABLE' // 시작 후 참가 시도
  | 'ROOM_FULL' // 인원 초과
  | 'NOT_HOST' // 방장 권한 없음
  | 'GAME_ALREADY_STARTED' // 이미 시작됨
  | 'GAME_NOT_STARTED' // 시작 전 상태
  | 'INVALID_STATE'; // 상태 전이 불가

/**
 * 참가자 상세 정보 (battle:participantsUpdated 용)
 */
export interface BattleParticipant {
  participantId: string; // 소켓 ID (고유 식별자)
  userId: number | null; // 로그인 유저는 ID, 비로그인은 null
  displayName: string; // 화면에 표시할 닉네임
  score: number; // 현재 누적 점수
  avatar?: string; // 프로필 이미지 URL (선택)
  isHost: boolean; // 방장 여부
  isConnected: boolean; // 현재 연결 여부
  joinedAt: number; // 입장 시간 (타임스탬프)
  leftAt: number | null; // 퇴장 시간
}

/**
 * 실시간 순위 정보 (battle:state / buildRankings 용)
 */
export interface Ranking {
  participantId: string;
  displayName: string;
  score: number;
}

/**
 * 방 설정 정보
 */
export interface BattleRoomSettings {
  fieldSlug: string; // 퀴즈 분야 (CS 등)
  maxPlayers: number; // 최대 인원
  timeLimitType: BattleTimeLimitType;
}

/**
 * 방 참여자 정보
 */
export interface Participant {
  id: number;
  name: string;
  avatar?: string;
  participantId: string;
  profileImageUrl?: string; // 로그인 사용자 프로필 이미지
}

/**
 * 배틀 방 전체 상태 (Store 관리용)
 */
export interface BattleRoomState {
  roomId: string;
  hostParticipantId: string; // 방장의 participantId
  status: BattleRoomStatus;
  settings: BattleRoomSettings;
  participants: BattleParticipant[];
  inviteToken: string;
  countdownEndsAt: number | null;
  startedAt: number | null;
  endedAt: number | null;
  currentQuizIndex: number;
  totalQuizzes: number;
}

/**
 * 퀴즈 데이터 정보 (battle:quiz 용)
 */
export interface BattleQuizData {
  quizId: number;
  question: QuizQuestion; // 퀴즈 지문 및 보기 포함
  index: number; // 현재 문제 번호 (0부터 시작)
  total: number; // 총 문제 수
  endsAt: number; // 문제 종료 서버 시각 (타임스탬프)
  serverTime: number;
}

/**
 * 문제 결과 정보 (battle:result 용)
 */
export interface BattleResultData {
  isCorrect: boolean;
  scoreDelta: number; // +10, -10 등 점수 변화량
  totalScore: number; // 합산된 최종 점수
}

/**
 * POST /battles/rooms/join 응답
 */
export interface JoinBattleRoomResponse {
  roomId: string;
  canJoin: boolean;
}
/**
 * 배틀 보상 정보
 */
export interface BattleReward {
  participantId: string;
  rewardType: 'diamond';
  amount: number;
}
