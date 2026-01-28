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
    this.handleLeave({ roomId: '' }, client);
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

    const participant = this.buildParticipant(room, payload, client.id);
    const nextRoom = applyJoin(room, { roomId: room.roomId, participant });
    const updatedRoom: BattleRoomState = room.hostParticipantId
      ? nextRoom
      : {
          ...nextRoom,
          hostParticipantId: participant.participantId,
        };

    this.battleService.saveRoom(updatedRoom);
    client.join(updatedRoom.roomId);
    this.server.to(updatedRoom.roomId).emit('battle:participantsUpdated', {
      roomId: updatedRoom.roomId,
      participants: updatedRoom.participants,
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

    const nextRoom: BattleRoomState = applyLeave(room, {
      roomId,
      participantId: client.id,
      now: Date.now(),
      penaltyScore: room.status === 'in_progress' ? -999 : 0,
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

    const nextRoom = applyStart(room, {
      roomId: room.roomId,
      requesterParticipantId: client.id,
      now: Date.now(),
      quizIds,
    });

    this.battleService.saveRoom(nextRoom);
    this.server.to(nextRoom.roomId).emit('battle:state', {
      roomId: nextRoom.roomId,
      status: nextRoom.status,
      remainingSeconds: nextRoom.settings.timeLimitSeconds,
      rankings: this.buildRankings(nextRoom),
    });

    await this.sendCurrentQuiz(nextRoom);
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
    // TODO: 정답 검증 및 점수 계산 로직 연결이 필요합니다.
    // TODO: 결과 브로드캐스트 타이밍(문제 종료 시점)과 협의가 필요합니다.
    void payload;
  }

  /**
   * 참가자 기본 정보를 생성한다.
   *
   * @param room 방 상태
   * @param payload 참가자 식별 정보
   * @param participantId 소켓 연결 ID
   * @returns 참가자 정보
   */
  private buildParticipant(
    room: { participants: BattleParticipant[] },
    payload: { userId?: number | null; displayName?: string },
    participantId: string,
  ): BattleParticipant {
    const displayName = payload.displayName ?? this.createGuestName(room.participants);

    return {
      participantId,
      userId: payload.userId ?? null,
      displayName,
      score: 0,
      isConnected: true,
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
      endsAt,
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

    setTimeout(async () => {
      const latestRoom = this.battleService.getRoom(room.roomId);
      if (!latestRoom) {
        return;
      }

      if (latestRoom.status !== 'in_progress') {
        return;
      }

      // TODO: 이 시점에 정답 검증/점수 계산을 실행해야 합니다.

      const nextIndex = latestRoom.currentQuizIndex + 1;
      if (nextIndex >= latestRoom.totalQuizzes) {
        // TODO: 최종 점수 기준 우승자 산정 및 보상 계산 연결 필요합니다.
        this.finishRoom(latestRoom.roomId);
        return;
      }

      const advancedRoom: BattleRoomState = {
        ...latestRoom,
        currentQuizIndex: nextIndex,
      };

      this.battleService.saveRoom(advancedRoom);
      await this.sendCurrentQuiz(advancedRoom);
    }, delayMs);
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
