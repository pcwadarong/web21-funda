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

import { BattleService } from './battle.service';
import {
  applyFinish,
  applyJoin,
  applyLeave,
  applyRestart,
  applyStart,
  applyUpdateRoom,
  BattleParticipant,
  BattleRoomState,
  BattleTimeLimitType,
  validateJoin,
  validateRestart,
  validateStart,
  validateUpdateRoom,
} from './battle-state';

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
    payload: { roomId: string; userId?: number | null; displayName?: string },
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

    const validation = validateJoin(room);
    if (!validation.ok) {
      client.emit('battle:error', validation);
      return;
    }

    // 쿠키에서 client_id 추출
    const clientId = this.extractClientIdFromCookie(client.handshake.headers.cookie);

    // 이미 같은 userId 또는 clientId를 가진 참여자가 있는지 확인
    const existingParticipant = room.participants.find(
      p => (payload.userId && p.userId === payload.userId) || (clientId && p.clientId === clientId),
    );

    let updatedRoom: BattleRoomState;

    if (existingParticipant) {
      // 기존 참여자: socket ID만 업데이트 (재연결 처리)
      const updatedParticipants = room.participants.map(p =>
        p.participantId === existingParticipant.participantId
          ? { ...p, participantId: client.id, isConnected: true }
          : p,
      );

      const nextRoom: BattleRoomState = {
        ...room,
        participants: updatedParticipants,
      };

      // hostParticipantId를 clientId 또는 userId로 설정
      const hostId = clientId || payload.userId?.toString();

      updatedRoom = room.hostParticipantId
        ? nextRoom
        : {
            ...nextRoom,
            hostParticipantId: hostId || existingParticipant.participantId,
          };

      this.logger.log(
        `Reconnected participant: userId=${payload.userId}, clientId=${clientId}, socketId=${client.id}`,
      );
    } else {
      // 새로운 참여자: 추가
      const participant = this.buildParticipant(room, payload, client.id, clientId);
      const nextRoom = applyJoin(room, { roomId: room.roomId, participant });

      // hostParticipantId를 clientId 또는 userId로 설정 (socket 재연결 대비)
      const hostId = clientId || payload.userId?.toString();

      updatedRoom = room.hostParticipantId
        ? nextRoom
        : {
            ...nextRoom,
            hostParticipantId: hostId || participant.participantId,
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
    const room = this.battleService.getRoom(payload.roomId);
    if (!room) {
      client.emit('battle:error', {
        code: 'ROOM_NOT_FOUND',
        message: '방을 찾을 수 없습니다.',
      });
      return;
    }

    const nextRoom: BattleRoomState = applyLeave(room, {
      roomId: room.roomId,
      participantId: client.id,
      now: Date.now(),
    });

    this.battleService.saveRoom(nextRoom);
    client.leave(nextRoom.roomId);

    this.server.to(nextRoom.roomId).emit('battle:participantsUpdated', {
      roomId: nextRoom.roomId,
      participants: nextRoom.participants,
    });

    if (nextRoom.status === 'invalid') {
      this.server.to(nextRoom.roomId).emit('battle:invalid', {
        roomId: nextRoom.roomId,
        reason: '참가자가 부족합니다.',
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
    const nextRoom = applyUpdateRoom(room, {
      roomId: room.roomId,
      requesterParticipantId: client.id,
      fieldSlug: payload.fieldSlug,
      maxPlayers: payload.maxPlayers,
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
  handleStart(@MessageBody() payload: { roomId: string }, @ConnectedSocket() client: Socket): void {
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

    const nextRoom = applyStart(room, {
      roomId: room.roomId,
      requesterParticipantId: client.id,
      now: Date.now(),
    });

    this.battleService.saveRoom(nextRoom);
    this.server.to(nextRoom.roomId).emit('battle:state', {
      roomId: nextRoom.roomId,
      status: nextRoom.status,
      remainingSeconds: nextRoom.settings.timeLimitSeconds,
      rankings: this.buildRankings(nextRoom),
    });
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

    this.battleService.saveRoom(nextRoom);
    this.server.to(nextRoom.roomId).emit('battle:state', {
      roomId: nextRoom.roomId,
      status: nextRoom.status,
      remainingSeconds: nextRoom.settings.timeLimitSeconds,
      rankings: this.buildRankings(nextRoom),
    });
  }

  /**
   * 정답 제출 요청을 처리한다.
   *
   * @param payload 방 ID, 퀴즈 ID, 제출 답안
   * @returns 없음
   */
  @SubscribeMessage('battle:submitAnswer')
  handleSubmitAnswer(
    @MessageBody() payload: { roomId: string; quizId: number; answer: unknown },
  ): void {
    void payload;
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
    payload: { userId?: number | null; displayName?: string },
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
      isConnected: true,
      isHost,
      joinedAt: Date.now(),
      leftAt: null,
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
   * 게임 종료 처리를 수행한다.
   *
   * @param roomId 방 ID
   * @returns 없음
   */
  finishRoom(roomId: string): void {
    // TODO: 타이머 종료 시점에 이 메서드를 호출하도록 연결 필요. 재광님 작업
    const room = this.battleService.getRoom(roomId);
    if (!room) {
      return;
    }

    const nextRoom = applyFinish(room, {
      roomId: room.roomId,
      now: Date.now(),
    });

    this.battleService.saveRoom(nextRoom);
    this.server.to(nextRoom.roomId).emit('battle:finish', {
      roomId: nextRoom.roomId,
      rankings: this.buildRankings(nextRoom),
      rewards: [],
    });
  }

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
}
