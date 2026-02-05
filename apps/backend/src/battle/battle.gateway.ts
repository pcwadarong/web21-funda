import { Injectable, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

import type { MatchingPair } from '../roadmap/dto/quiz-submission.dto';

import { BattleService } from './battle.service';
import {
  applyCancelCountdown,
  applyDisconnect,
  applyFinish,
  applyJoin,
  applyLeave,
  applyRestart,
  applyStart,
  applyStartCountdown,
  applySubmission,
  applyUpdateRoom,
  BattleParticipant,
  BattleQuizSubmission,
  BattleRoomState,
  BattleTimeLimitType,
  clampMaxPlayers,
  validateJoin,
  validateRestart,
  validateStart,
  validateUpdateRoom,
} from './battle-state';

const COUNTDOWN_STEP_MS = 1000;
const COUNTDOWN_STEP_COUNT = 4;
const COUNTDOWN_DURATION_MS = COUNTDOWN_STEP_MS * COUNTDOWN_STEP_COUNT;

@Injectable()
@WebSocketGateway({
  namespace: '/battle',
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
})
export class BattleGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server!: Server;
  private readonly logger = new Logger('BattleGateway');
  private readonly countdownStartTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly quizAdvanceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly resultNextQuizTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(private readonly battleService: BattleService) {}

  /**
   * Gateway 초기화 시 호출된다.
   *
   * @param _server Socket.IO 서버 인스턴스
   */
  afterInit(_server: Server): void {
    const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
    this.logger.log(`Battle Gateway initialized with CORS origin: ${clientOrigin}`);
  }

  /**
   * 클라이언트 연결 시 호출된다.
   *
   * @param client 소켓 연결 정보
   */
  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /**
   * 클라이언트 연결 해제 시 호출된다.
   *
   * @param client 소켓 연결 정보
   */
  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.handleDisconnectInternal(client);
  }

  /**
   * 연결 해제 시 참가자를 일시적으로 연결 해제 처리한다.
   *
   * @param client 소켓 연결 정보
   * @returns 없음
   */
  private handleDisconnectInternal(client: Socket): void {
    const roomId = this.findRoomIdByParticipant(client.id);
    if (!roomId) {
      return;
    }

    const room = this.battleService.getRoom(roomId);
    if (!room) {
      return;
    }

    const now = Date.now();

    // 퇴장할 참가자 정보 미리 보관
    const leavingParticipant = room.participants.find(p => p.participantId === client.id) ?? null;

    let nextRoom: BattleRoomState;
    if (room.status === 'in_progress') {
      nextRoom = applyLeave(room, {
        roomId,
        participantId: client.id,
        now,
        penaltyScore: -999,
      });
    } else if (room.status === 'waiting' || room.status === 'countdown') {
      nextRoom = applyDisconnect(room, {
        roomId,
        participantId: client.id,
        now,
      });
    } else {
      nextRoom = applyDisconnect(room, {
        roomId,
        participantId: client.id,
        now,
      });
    }

    const normalizedRoom = this.cancelCountdownIfNeeded(nextRoom);

    this.battleService.saveRoom(normalizedRoom);

    this.server.to(normalizedRoom.roomId).emit('battle:participantsUpdated', {
      roomId: normalizedRoom.roomId,
      participants: normalizedRoom.participants,
      leavingParticipant: leavingParticipant
        ? {
            participantId: leavingParticipant.participantId,
            displayName: leavingParticipant.displayName,
          }
        : null,
    });

    const remainingSeconds = normalizedRoom.quizEndsAt
      ? Math.max(0, Math.ceil((normalizedRoom.quizEndsAt - Date.now()) / 1000))
      : normalizedRoom.settings.timeLimitSeconds;

    this.server.to(normalizedRoom.roomId).emit('battle:state', {
      roomId: normalizedRoom.roomId,
      status: normalizedRoom.status,
      remainingSeconds,
      rankings: this.buildRankings(normalizedRoom),
      countdownEndsAt: normalizedRoom.countdownEndsAt,
    });

    if (normalizedRoom.status === 'invalid') {
      this.clearRoomTimers(normalizedRoom.roomId);
      this.server.to(normalizedRoom.roomId).emit('battle:invalid', {
        roomId: normalizedRoom.roomId,
        reason: '참가자가 부족하여 종료 되었습니다.',
      });
    }
  }

  /**
   * Ping 이벤트를 처리하고 Pong 응답을 반환한다.
   *
   * @param client 소켓 연결 정보
   * @returns 타임스탬프가 포함된 Pong 응답
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): WsResponse<{ timestamp: number }> {
    this.logger.debug(`Ping received from client: ${client.id}`);
    return {
      event: 'pong',
      data: {
        timestamp: Date.now(),
      },
    };
  }

  /**
   * 배틀 방 참가 요청을 처리한다.
   *
   * @param payload 방 ID 및 참가자 정보
   * @param client 소켓 연결 정보
   * @returns 없음
   */
  @SubscribeMessage('battle:join')
  handleJoin(
    @MessageBody()
    payload: {
      roomId: string;
      userId?: number | null;
      displayName?: string;
      profileImageUrl?: string;
    },
    @ConnectedSocket() client: Socket,
  ): void {
    const room = this.battleService.getRoom(payload.roomId);
    if (!room) {
      client.emit('battle:error', {
        code: 'ROOM_NOT_FOUND',
        message: '방을 찾을 수 없습니다.',
      });
      return;
    }

    // 쿠키에서 client_id 추출
    const clientId = this.extractClientIdFromCookie(client.handshake.headers.cookie);

    // 이미 같은 userId 또는 clientId를 가진 참여자가 있는지 확인
    const existingParticipant = room.participants.find(
      p => (payload.userId && p.userId === payload.userId) || (clientId && p.clientId === clientId),
    );

    if (!existingParticipant) {
      const validation = validateJoin(room);
      if (!validation.ok) {
        client.emit('battle:error', validation);
        return;
      }
    }

    let updatedRoom: BattleRoomState;

    if (existingParticipant) {
      // 기존 참여자: socket ID만 업데이트 (재연결 처리)
      const previousParticipantId = existingParticipant.participantId;
      const updatedParticipantId = client.id;

      const updatedParticipants = room.participants.map(participant =>
        participant.participantId === previousParticipantId
          ? { ...participant, participantId: updatedParticipantId, isConnected: true, leftAt: null }
          : participant,
      );

      let nextHostParticipantId = room.hostParticipantId;
      if (!nextHostParticipantId) {
        nextHostParticipantId = updatedParticipantId;
      }

      if (room.hostParticipantId === previousParticipantId) {
        nextHostParticipantId = updatedParticipantId;
      }

      const normalizedParticipants = updatedParticipants.map(participant => ({
        ...participant,
        isHost: participant.participantId === nextHostParticipantId,
      }));

      updatedRoom = {
        ...room,
        hostParticipantId: nextHostParticipantId,
        participants: normalizedParticipants,
      };

      this.logger.log(
        `Reconnected participant: userId=${payload.userId}, clientId=${clientId}, socketId=${client.id}`,
      );
    } else {
      // 새로운 참여자: 추가
      const participant = this.buildParticipant(room, payload, client.id, clientId);
      const nextRoom = applyJoin(room, { roomId: room.roomId, participant });

      const nextHostParticipantId = room.hostParticipantId || participant.participantId;

      const normalizedParticipants = nextRoom.participants.map(currentParticipant => ({
        ...currentParticipant,
        isHost: currentParticipant.participantId === nextHostParticipantId,
      }));

      updatedRoom = {
        ...nextRoom,
        hostParticipantId: nextHostParticipantId,
        participants: normalizedParticipants,
      };

      this.logger.log(
        `New participant joined: userId=${payload.userId}, clientId=${clientId}, socketId=${client.id}`,
      );
    }

    this.battleService.saveRoom(updatedRoom);
    client.join(updatedRoom.roomId);
    this.server.to(updatedRoom.roomId).emit('battle:participantsUpdated', {
      roomId: updatedRoom.roomId,
      participants: updatedRoom.participants,
      settings: updatedRoom.settings,
    });
  }

  /**
   * 배틀 방 퇴장 요청을 처리한다.
   *
   * @param payload 방 ID
   * @param client 소켓 연결 정보
   * @returns 없음
   */
  @SubscribeMessage('battle:leave')
  handleLeave(@MessageBody() payload: { roomId: string }, @ConnectedSocket() client: Socket): void {
    const roomId = payload.roomId || this.findRoomIdByParticipant(client.id);
    if (!roomId) {
      return;
    }

    const room = this.battleService.getRoom(roomId);
    if (!room) {
      client.emit('battle:error', {
        code: 'ROOM_NOT_FOUND',
        message: '방을 찾을 수 없습니다.',
      });
      return;
    }

    // 퇴장할 참가자 정보 미리 보관
    const leavingParticipant = room.participants.find(p => p.participantId === client.id) ?? null;

    const nextRoom: BattleRoomState = applyLeave(room, {
      roomId,
      participantId: client.id,
      now: Date.now(),
      penaltyScore: room.status === 'in_progress' ? -999 : 0,
    });

    const normalizedRoom = this.cancelCountdownIfNeeded(nextRoom);

    this.battleService.saveRoom(normalizedRoom);
    client.leave(normalizedRoom.roomId);

    this.server.to(normalizedRoom.roomId).emit('battle:participantsUpdated', {
      roomId: normalizedRoom.roomId,
      participants: normalizedRoom.participants,
      leavingParticipant: leavingParticipant
        ? {
            participantId: leavingParticipant.participantId,
            displayName: leavingParticipant.displayName,
          }
        : null,
    });

    const remainingSeconds = normalizedRoom.quizEndsAt
      ? Math.max(0, Math.ceil((normalizedRoom.quizEndsAt - Date.now()) / 1000))
      : normalizedRoom.settings.timeLimitSeconds;

    this.server.to(normalizedRoom.roomId).emit('battle:state', {
      roomId: normalizedRoom.roomId,
      status: normalizedRoom.status,
      remainingSeconds,
      rankings: this.buildRankings(normalizedRoom),
      countdownEndsAt: normalizedRoom.countdownEndsAt,
    });

    if (normalizedRoom.status === 'invalid') {
      this.clearRoomTimers(normalizedRoom.roomId);
      this.server.to(normalizedRoom.roomId).emit('battle:invalid', {
        roomId: normalizedRoom.roomId,
        reason: '참가자가 부족하여 종료 되었습니다.',
      });
    }
  }

  /**
   * 방 설정 변경 요청을 처리한다.
   *
   * @param payload 방 ID 및 변경할 설정 값
   * @param client 소켓 연결 정보
   * @returns 없음
   */
  @SubscribeMessage('battle:updateRoom')
  handleUpdateRoom(
    @MessageBody()
    payload: {
      roomId: string;
      fieldSlug: string;
      maxPlayers: number;
      timeLimitType: BattleTimeLimitType;
    },
    @ConnectedSocket() client: Socket,
  ): void {
    const room = this.battleService.getRoom(payload.roomId);
    if (!room) {
      client.emit('battle:error', {
        code: 'ROOM_NOT_FOUND',
        message: '방을 찾을 수 없습니다.',
      });
      return;
    }

    const validation = validateUpdateRoom(room, client.id);
    if (!validation.ok) {
      client.emit('battle:error', validation);
      return;
    }

    const timeLimitSeconds = this.getTimeLimitSeconds(payload.timeLimitType);
    const maxPlayers = clampMaxPlayers(payload.maxPlayers);
    const nextRoom = applyUpdateRoom(room, {
      roomId: room.roomId,
      requesterParticipantId: client.id,
      fieldSlug: payload.fieldSlug,
      maxPlayers,
      timeLimitType: payload.timeLimitType,
      timeLimitSeconds,
    });

    this.battleService.saveRoom(nextRoom);
    this.server.to(nextRoom.roomId).emit('battle:roomUpdated', {
      roomId: nextRoom.roomId,
      fieldSlug: nextRoom.settings.fieldSlug,
      maxPlayers: nextRoom.settings.maxPlayers,
      timeLimitType: nextRoom.settings.timeLimitType,
      participants: nextRoom.participants,
      timeLimitSeconds: nextRoom.settings.timeLimitSeconds,
    });
    this.server.to(nextRoom.roomId).emit('battle:participantsUpdated', {
      roomId: nextRoom.roomId,
      participants: nextRoom.participants,
    });
  }

  /**
   * 게임 시작 요청을 처리한다.
   *
   * @param payload 방 ID
   * @param client 소켓 연결 정보
   * @returns 없음
   */
  @SubscribeMessage('battle:start')
  async handleStart(
    @MessageBody() payload: { roomId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const room = this.battleService.getRoom(payload.roomId);
    if (!room) {
      client.emit('battle:error', {
        code: 'ROOM_NOT_FOUND',
        message: '방을 찾을 수 없습니다.',
      });
      return;
    }

    const validation = validateStart(room, client.id);
    if (!validation.ok) {
      client.emit('battle:error', validation);
      return;
    }

    const quizIds = await this.battleService.createBattleQuizSet(
      room.settings.fieldSlug,
      room.totalQuizzes,
    );

    const now = Date.now();
    const countdownEndsAt = now + COUNTDOWN_DURATION_MS;

    const nextRoom = applyStartCountdown(room, {
      roomId: room.roomId,
      requesterParticipantId: client.id,
      now,
      countdownEndsAt,
      quizIds,
    });

    this.clearCountdownTimer(nextRoom.roomId);
    this.battleService.saveRoom(nextRoom);
    this.server.to(nextRoom.roomId).emit('battle:state', {
      roomId: nextRoom.roomId,
      status: nextRoom.status,
      remainingSeconds: Math.max(0, Math.ceil((countdownEndsAt - now) / 1000)),
      rankings: this.buildRankings(nextRoom),
      countdownEndsAt: nextRoom.countdownEndsAt,
    });
  }

  /**
   * 배틀 준비 완료 신호를 처리한다.
   *
   * @param payload 방 ID
   * @param client 소켓 연결 정보
   * @returns 없음
   */
  @SubscribeMessage('battle:ready')
  handleReady(@MessageBody() payload: { roomId: string }, @ConnectedSocket() client: Socket): void {
    const room = this.battleService.getRoom(payload.roomId);
    if (!room) {
      client.emit('battle:error', {
        code: 'ROOM_NOT_FOUND',
        message: '방을 찾을 수 없습니다.',
      });
      return;
    }

    if (room.status !== 'countdown') {
      return;
    }

    const participant = room.participants.find(p => p.participantId === client.id);
    if (!participant) {
      return;
    }

    if (room.readyParticipantIds.includes(participant.participantId)) {
      return;
    }

    const nextReadyParticipantIds = [...room.readyParticipantIds, participant.participantId];
    const nextRoom: BattleRoomState = {
      ...room,
      readyParticipantIds: nextReadyParticipantIds,
    };

    this.battleService.saveRoom(nextRoom);

    if (!this.isAllParticipantsReady(nextRoom)) {
      return;
    }

    if (!nextRoom.countdownEndsAt) {
      return;
    }

    const now = Date.now();
    if (now >= nextRoom.countdownEndsAt) {
      this.startBattleAfterCountdown(nextRoom.roomId);
      return;
    }

    this.scheduleStartAfterCountdown(nextRoom);
  }

  /**
   * 게임 재시작 요청을 처리한다.
   *
   * @param payload 방 ID
   * @param client 소켓 연결 정보
   * @returns 없음
   */
  @SubscribeMessage('battle:restart')
  handleRestart(
    @MessageBody() payload: { roomId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const room = this.battleService.getRoom(payload.roomId);
    if (!room) {
      client.emit('battle:error', {
        code: 'ROOM_NOT_FOUND',
        message: '방을 찾을 수 없습니다.',
      });
      return;
    }

    const validation = validateRestart(room);
    if (!validation.ok) {
      client.emit('battle:error', validation);
      return;
    }

    const nextRoom = applyRestart(room, {
      roomId: room.roomId,
      requesterParticipantId: client.id,
    });

    this.clearRoomTimers(nextRoom.roomId);
    this.battleService.saveRoom(nextRoom);
    this.server.to(nextRoom.roomId).emit('battle:state', {
      roomId: nextRoom.roomId,
      status: nextRoom.status,
      remainingSeconds: nextRoom.settings.timeLimitSeconds,
      rankings: this.buildRankings(nextRoom),
      countdownEndsAt: nextRoom.countdownEndsAt,
    });
  }

  /**
   * 정답 제출 요청을 처리한다.
   *
   * @param payload 방 ID, 퀴즈 ID, 제출 답안
   * @returns 없음
   */
  @SubscribeMessage('battle:submitAnswer')
  async handleSubmitAnswer(
    @MessageBody()
    payload: { roomId: string; quizId: number; answer: string | { pairs: MatchingPair[] } | null },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const room = this.battleService.getRoom(payload.roomId);
    if (!room) {
      return;
    }

    if (room.status !== 'in_progress') {
      return;
    }

    const currentQuizId = room.quizIds[room.currentQuizIndex];
    if (currentQuizId !== payload.quizId) {
      return;
    }

    const participant = room.participants.find(
      currentParticipant => currentParticipant.participantId === client.id,
    );
    if (!participant) {
      return;
    }

    const alreadySubmitted = participant.submissions.some(
      submission => submission.quizId === payload.quizId,
    );
    if (alreadySubmitted) {
      return;
    }

    const selection = this.buildSelection(payload.answer);
    const quizResult = await this.battleService.getBattleQuizResultById(payload.quizId, {
      quiz_id: payload.quizId,
      type: '',
      selection,
    });

    if (!quizResult) {
      return;
    }

    const scoreDelta = quizResult.is_correct ? 10 : -10;
    const totalScore = participant.score + scoreDelta;

    const updatedRoom = applySubmission(room, {
      participantId: participant.participantId,
      quizId: payload.quizId,
      isCorrect: quizResult.is_correct,
      scoreDelta,
      totalScore,
      quizResult,
      submittedAt: Date.now(),
    });

    this.battleService.saveRoom(updatedRoom);
  }

  /**
   * 제출 답안을 selection 구조로 변환한다.
   *
   * @param answer 제출 답안
   * @returns selection 객체
   */
  private buildSelection(answer: unknown): { option_id?: string; pairs?: MatchingPair[] } {
    if (typeof answer === 'string') {
      return { option_id: answer };
    }

    if (this.isMatchingAnswer(answer)) {
      return { pairs: answer.pairs };
    }

    return {};
  }

  /**
   * 매칭 답안 여부를 확인한다.
   *
   * @param answer 제출 답안
   * @returns 매칭 답안 여부
   */
  private isMatchingAnswer(answer: unknown): answer is { pairs: MatchingPair[] } {
    if (!answer || typeof answer !== 'object') {
      return false;
    }

    return Array.isArray((answer as { pairs?: unknown }).pairs);
  }

  /**
   * 참가자 기본 정보를 생성한다.
   *
   * @param room 방 상태
   * @param payload 참가자 식별 정보
   * @param participantId 소켓 연결 ID
   * @param clientId 게스트 사용자 식별자 (클라이언트 쿠키)
   * @returns 참가자 정보
   */
  private buildParticipant(
    room: { participants: BattleParticipant[]; hostParticipantId?: string },
    payload: { userId?: number | null; displayName?: string; profileImageUrl?: string },
    participantId: string,
    clientId?: string,
  ): BattleParticipant {
    const displayName = payload.displayName ?? this.createGuestName(room.participants);
    // 첫 번째 참가자(호스트가 아직 정해지지 않은 경우)가 호스트가 된다
    const isHost = !room.hostParticipantId;

    return {
      participantId,
      userId: payload.userId ?? null,
      clientId,
      displayName,
      score: 0,
      submissions: [],
      isConnected: true,
      isHost,
      joinedAt: Date.now(),
      leftAt: null,
      avatar: payload.profileImageUrl,
    };
  }

  /**
   * 비로그인 참가자 닉네임을 생성한다.
   *
   * @param participants 현재 참가자 목록
   * @returns 생성된 닉네임
   */
  private createGuestName(participants: BattleParticipant[]): string {
    const adjectives = [
      '반짝이는',
      '수상한',
      '깜짝',
      '뒤집힌',
      '엉뚱한',
      '날쌘',
      '느긋한',
      '통통한',
      '숨은',
      '엎지른',
      '파닥이는',
      '멋쩍은',
      '바쁜',
      '졸린',
      '삐딱한',
    ];

    const animals = [
      '호랑이',
      '사자',
      '곰',
      '여우',
      '늑대',
      '토끼',
      '고양이',
      '강아지',
      '돌고래',
      '펭귄',
      '코알라',
      '판다',
      '수달',
      '사슴',
      '기린',
    ];

    const existingNames = new Set(participants.map(participant => participant.displayName));
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    const baseName = `${randomAdjective}${randomAnimal}`;

    let index = 1;
    while (existingNames.has(`${baseName}${index}`)) {
      index += 1;
    }

    return `${baseName}${index}`;
  }

  /**
   * 쿠키 헤더에서 client_id를 추출한다.
   *
   * @param cookieHeader Set-Cookie 헤더 값
   * @returns client_id 또는 undefined
   */
  private extractClientIdFromCookie(cookieHeader?: string): string | undefined {
    if (!cookieHeader) {
      return undefined;
    }

    const cookies = cookieHeader.split(';').map(c => c.trim());
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=');
      if (name === 'client_id' && value) {
        return decodeURIComponent(value);
      }
    }

    return undefined;
  }

  /**
   * 참가자 ID로 방 ID를 찾는다.
   *
   * @param participantId 참가자 ID
   * @returns 방 ID
   */
  private findRoomIdByParticipant(participantId: string): string | null {
    const rooms = this.battleService.getAllRooms();

    for (const room of rooms) {
      const participant = room.participants.find(
        currentParticipant => currentParticipant.participantId === participantId,
      );
      if (participant) {
        return room.roomId;
      }
    }

    return null;
  }

  /**
   * 제한 시간 타입을 초 단위로 변환한다.
   *
   * @param timeLimitType 제한 시간 타입
   * @returns 제한 시간(초)
   */
  private getTimeLimitSeconds(timeLimitType: BattleTimeLimitType): number {
    if (timeLimitType === 'relaxed') {
      return 25;
    }

    if (timeLimitType === 'fast') {
      return 10;
    }

    return 15;
  }

  /**
   * 카운트다운 종료 시점에 게임 시작을 예약한다.
   *
   * @param room 방 상태
   * @returns 없음
   */
  private scheduleStartAfterCountdown(room: BattleRoomState): void {
    if (!room.countdownEndsAt) {
      return;
    }

    if (this.countdownStartTimers.has(room.roomId)) {
      return;
    }

    const delayMs = Math.max(0, room.countdownEndsAt - Date.now());
    const timerId = setTimeout(() => {
      this.countdownStartTimers.delete(room.roomId);
      this.startBattleAfterCountdown(room.roomId);
    }, delayMs);

    this.countdownStartTimers.set(room.roomId, timerId);
  }

  /**
   * 카운트다운 종료 후 게임 시작 조건을 다시 확인하고 시작한다.
   *
   * @param roomId 방 ID
   * @returns 없음
   */
  private startBattleAfterCountdown(roomId: string): void {
    const room = this.battleService.getRoom(roomId);
    if (!room) {
      return;
    }

    if (room.status !== 'countdown') {
      return;
    }

    if (!this.isAllParticipantsReady(room)) {
      return;
    }

    if (!room.countdownEndsAt) {
      return;
    }

    if (Date.now() < room.countdownEndsAt) {
      this.scheduleStartAfterCountdown(room);
      return;
    }

    const nextRoom = applyStart(room, {
      roomId: room.roomId,
      requesterParticipantId: room.hostParticipantId,
      now: Date.now(),
      quizIds: room.quizIds,
    });

    this.clearCountdownTimer(room.roomId);
    this.battleService.saveRoom(nextRoom);
    this.server.to(nextRoom.roomId).emit('battle:state', {
      roomId: nextRoom.roomId,
      status: nextRoom.status,
      remainingSeconds: nextRoom.settings.timeLimitSeconds,
      rankings: this.buildRankings(nextRoom),
      countdownEndsAt: nextRoom.countdownEndsAt,
    });

    void this.sendCurrentQuiz(nextRoom);
  }

  /**
   * 카운트다운 예약 타이머를 해제한다.
   *
   * @param roomId 방 ID
   * @returns 없음
   */
  private clearCountdownTimer(roomId: string): void {
    const timer = this.countdownStartTimers.get(roomId);
    if (!timer) {
      return;
    }

    clearTimeout(timer);
    this.countdownStartTimers.delete(roomId);
  }

  /**
   * 다음 문제 전송 예약 타이머를 해제한다.
   *
   * @param roomId 방 ID
   * @returns 없음
   */
  private clearQuizAdvanceTimer(roomId: string): void {
    const timer = this.quizAdvanceTimers.get(roomId);
    if (!timer) {
      return;
    }

    clearTimeout(timer);
    this.quizAdvanceTimers.delete(roomId);
  }

  /**
   * 결과 화면 이후 다음 문제 전송 예약 타이머를 해제한다.
   *
   * @param roomId 방 ID
   * @returns 없음
   */
  private clearResultNextQuizTimer(roomId: string): void {
    const timer = this.resultNextQuizTimers.get(roomId);
    if (!timer) {
      return;
    }

    clearTimeout(timer);
    this.resultNextQuizTimers.delete(roomId);
  }

  /**
   * 방장 재할당 예약 타이머를 해제한다.
   *
   * @param roomId 방 ID
   * @returns 없음
   */

  /**
   * 방과 관련된 모든 예약 타이머를 해제한다.
   *
   * @param roomId 방 ID
   * @returns 없음
   */
  private clearRoomTimers(roomId: string): void {
    this.clearCountdownTimer(roomId);
    this.clearQuizAdvanceTimer(roomId);
    this.clearResultNextQuizTimer(roomId);
  }

  /**
   * 카운트다운 중 인원이 부족하면 대기 상태로 되돌린다.
   *
   * @param room 방 상태
   * @returns 변경된 방 상태
   */
  private cancelCountdownIfNeeded(room: BattleRoomState): BattleRoomState {
    if (room.status !== 'countdown') {
      return room;
    }

    const connectedCount = room.participants.filter(participant => participant.isConnected).length;
    if (connectedCount >= 2) {
      return room;
    }

    this.clearCountdownTimer(room.roomId);
    return applyCancelCountdown(room);
  }

  /**
   * 게임 종료 처리를 수행한다.
   *
   * @param roomId 방 ID
   * @returns 없음
   */
  async finishRoom(roomId: string): Promise<void> {
    // 타이머 종료 시점은 scheduleNextQuiz에서 연결한다.
    const room = this.battleService.getRoom(roomId);
    if (!room) {
      return;
    }

    const nextRoom = applyFinish(room, {
      roomId: room.roomId,
      now: Date.now(),
    });

    this.battleService.saveRoom(nextRoom);

    const winnerUserIds = this.getWinnerUserIds(nextRoom);
    if (winnerUserIds.length > 0) {
      await this.battleService.grantDiamondRewards(winnerUserIds, 2);
    }

    this.clearRoomTimers(nextRoom.roomId);
    this.server.to(nextRoom.roomId).emit('battle:finish', {
      roomId: nextRoom.roomId,
      rankings: this.buildRankings(nextRoom),
      rewards: this.buildRewards(nextRoom),
    });
  }

  /**
   * 현재 문제를 참가자에게 전송한다.
   *
   * @param room 방 상태
   * @returns 없음
   */
  private async sendCurrentQuiz(room: BattleRoomState): Promise<void> {
    const quizId = room.quizIds[room.currentQuizIndex];
    if (!quizId) {
      return;
    }

    const quiz = await this.battleService.getBattleQuizById(quizId);
    if (!quiz) {
      this.server.to(room.roomId).emit('battle:error', {
        code: 'INVALID_STATE',
        message: '퀴즈를 찾을 수 없습니다.',
      });
      return;
    }

    const endsAt = Date.now() + room.settings.timeLimitSeconds * 1000;

    this.server.to(room.roomId).emit('battle:quiz', {
      roomId: room.roomId,
      quizId,
      question: quiz,
      index: room.currentQuizIndex,
      total: room.totalQuizzes,
      endsAt: endsAt,
      serverTime: Date.now(),
    });

    const nextRoom: BattleRoomState = {
      ...room,
      quizEndsAt: endsAt,
    };
    this.battleService.saveRoom(nextRoom);

    this.scheduleNextQuiz(nextRoom);
  }

  /**
   * 다음 문제 전송을 예약한다.
   *
   * @param room 방 상태
   * @returns 없음
   */
  private scheduleNextQuiz(room: BattleRoomState): void {
    const delayMs = Math.max(0, (room.quizEndsAt ?? Date.now()) - Date.now());

    this.clearQuizAdvanceTimer(room.roomId);

    const timerId = setTimeout(async () => {
      this.clearQuizAdvanceTimer(room.roomId);

      const latestRoom = this.battleService.getRoom(room.roomId);
      if (!latestRoom) {
        return;
      }

      if (latestRoom.status !== 'in_progress') {
        return;
      }

      const nextIndex = latestRoom.currentQuizIndex + 1;
      if (nextIndex >= latestRoom.totalQuizzes) {
        void this.revealQuizResult(latestRoom, latestRoom, {
          finishAfterResult: true,
        });
        return;
      }

      const advancedRoom: BattleRoomState = {
        ...latestRoom,
        currentQuizIndex: nextIndex,
      };

      this.revealQuizResult(latestRoom, advancedRoom);
    }, delayMs);

    this.quizAdvanceTimers.set(room.roomId, timerId);
  }

  /**
   * 문제 종료 후 결과를 공개하고 다음 문제 전송을 예약한다.
   *
   * @param latestRoom 현재 방 상태
   * @param advancedRoom 다음 문제로 인덱스가 증가된 방 상태
   * @param options 결과 표시 및 종료 옵션
   * @returns 없음
   */
  private async revealQuizResult(
    room: BattleRoomState,
    advancedRoom: BattleRoomState,
    options?: { finishAfterResult?: boolean; delaySeconds?: number },
  ): Promise<void> {
    const delaySeconds = options?.delaySeconds ?? 5;
    const resultEndsAt = Date.now() + delaySeconds * 1000;
    const delayMs = Math.max(0, (resultEndsAt ?? Date.now()) - Date.now());

    const latestRoom = this.battleService.getRoom(room.roomId);
    if (!latestRoom) {
      return;
    }

    const normalizedRoom = await this.normalizeRoom(latestRoom);
    const roomWithResultEndsAt: BattleRoomState = {
      ...normalizedRoom,
      resultEndsAt,
    };
    this.battleService.saveRoom(roomWithResultEndsAt);

    const sockets = await this.server.to(roomWithResultEndsAt.roomId).fetchSockets();

    //문제 종료 시점에 문제 결과 및 state 전송
    sockets.forEach(socket => {
      const participantId = socket.id;
      const submission = this.getSubmission(normalizedRoom, participantId); // 저장해둔 제출

      socket.emit('battle:result', {
        roomId: roomWithResultEndsAt.roomId,
        isCorrect: submission?.isCorrect,
        scoreDelta: submission?.scoreDelta,
        totalScore: submission?.totalScore,
        quizResult: submission?.quizResult,
      });
    });

    this.server.to(roomWithResultEndsAt.roomId).emit('battle:resultTime', {
      roomId: roomWithResultEndsAt.roomId,
      resultEndsAt,
      serverTime: Date.now(),
    });

    this.server.to(roomWithResultEndsAt.roomId).emit('battle:state', {
      roomId: roomWithResultEndsAt.roomId,
      status: roomWithResultEndsAt.status,
      remainingSeconds: delaySeconds,
      rankings: this.buildRankings(roomWithResultEndsAt),
      countdownEndsAt: roomWithResultEndsAt.countdownEndsAt,
    });

    const shouldFinishAfterResult = options?.finishAfterResult === true;
    const nextRoom = {
      ...roomWithResultEndsAt,
      currentQuizIndex: shouldFinishAfterResult
        ? roomWithResultEndsAt.currentQuizIndex
        : advancedRoom.currentQuizIndex,
    };
    this.battleService.saveRoom(nextRoom);

    this.clearResultNextQuizTimer(nextRoom.roomId);

    const timerId = setTimeout(async () => {
      this.clearResultNextQuizTimer(nextRoom.roomId);

      const latestRoom = this.battleService.getRoom(nextRoom.roomId);
      if (!latestRoom) {
        return;
      }

      if (latestRoom.status !== 'in_progress') {
        return;
      }

      if (shouldFinishAfterResult) {
        await this.finishRoom(nextRoom.roomId);
        return;
      }

      await this.sendCurrentQuiz(nextRoom);
    }, delayMs);

    this.resultNextQuizTimers.set(nextRoom.roomId, timerId);
  }

  /**
   * 미제출 참가자를 자동 오답 처리하여 방 상태를 정규화한다.
   *
   * @param room 현재 방 상태
   * @returns 정규화된 방 상태
   */
  private async normalizeRoom(room: BattleRoomState): Promise<BattleRoomState> {
    const quizId = room.quizIds[room.currentQuizIndex];
    let normalizedRoom = room;

    if (quizId) {
      const quizResult = await this.battleService.getBattleQuizResultById(quizId, {
        quiz_id: quizId,
        type: '',
        selection: {},
      });
      if (!quizResult) {
        this.logger.warn(`Quiz result not found for quizId=${quizId}, skipping normalization`);
        return normalizedRoom;
      }

      for (const participantId of room.participants.map(p => p.participantId)) {
        const participant = normalizedRoom.participants.find(
          p => p.participantId === participantId,
        );
        if (!participant) continue;
        if (participant.submissions.some(s => s.quizId === quizId)) continue;

        const scoreDelta = -10;
        const totalScore = participant.score + scoreDelta;

        normalizedRoom = applySubmission(normalizedRoom, {
          participantId,
          quizId,
          isCorrect: false,
          scoreDelta,
          totalScore,
          quizResult,
          submittedAt: Date.now(),
        });
      }
    }

    this.battleService.saveRoom(normalizedRoom);
    return normalizedRoom;
  }

  /**
   * 특정 참가자의 현재 문제 제출 정보를 조회한다.
   *
   * @param room 방 상태
   * @param participantId 참가자 ID
   * @returns 제출 정보 또는 null
   */
  private getSubmission(room: BattleRoomState, participantId: string): BattleQuizSubmission | null {
    const participant = room.participants.find(
      participant => participant.participantId === participantId,
    );

    const quizId = room.quizIds[room.currentQuizIndex];

    const submission = participant?.submissions.find(submission => submission.quizId === quizId);

    if (!submission) {
      return null;
    }

    return submission;
  }

  /**
   * 참가자 랭킹 정보를 생성한다.
   *
   * @param room 방 상태
   * @returns 랭킹 배열
   */
  private buildRankings(room: BattleRoomState): Array<{
    participantId: string;
    displayName: string;
    score: number;
  }> {
    const sorted = [...room.participants].sort(
      (a: BattleParticipant, b: BattleParticipant) => b.score - a.score,
    );

    return sorted.map((participant: BattleParticipant) => ({
      participantId: participant.participantId,
      displayName: participant.displayName,
      score: participant.score,
    }));
  }

  /**
   * 모든 참가자가 준비 완료 상태인지 확인한다.
   *
   * @param room 방 상태
   * @returns 모두 준비 완료 여부
   */
  private isAllParticipantsReady(room: BattleRoomState): boolean {
    const connectedParticipants = room.participants.filter(participant => participant.isConnected);

    if (connectedParticipants.length < 2) {
      return false;
    }

    const readySet = new Set(room.readyParticipantIds);
    return connectedParticipants.every(participant => readySet.has(participant.participantId));
  }

  /**
   * 우승자 보상 정보를 생성한다.
   *
   * @param room 방 상태
   * @returns 보상 목록
   */
  private buildRewards(room: BattleRoomState): Array<{
    participantId: string;
    rewardType: 'diamond';
    amount: number;
  }> {
    const rankings = this.buildRankings(room);
    if (rankings.length === 0) {
      return [];
    }

    const topRank = rankings[0];
    if (!topRank) {
      return [];
    }

    const topScore = topRank.score;
    const winners = rankings.filter(ranking => ranking.score === topScore);

    return winners.map(winner => ({
      participantId: winner.participantId,
      rewardType: 'diamond',
      amount: 2,
    }));
  }

  /**
   * 우승자 사용자 ID 목록을 조회한다.
   *
   * @param room 방 상태
   * @returns 우승자 사용자 ID 목록
   */
  private getWinnerUserIds(room: BattleRoomState): number[] {
    const rankings = this.buildRankings(room);
    const topRank = rankings[0];
    if (!topRank) {
      return [];
    }

    const topScore = topRank.score;
    const winners = room.participants.filter(participant => participant.score === topScore);

    const userIdSet = new Set<number>();
    for (const winner of winners) {
      if (winner.userId !== null) {
        userIdSet.add(winner.userId);
      }
    }

    return Array.from(userIdSet);
  }
}
