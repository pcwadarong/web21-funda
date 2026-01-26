import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

import { BattleService } from './battle.service';
import {
  applyJoin,
  applyLeave,
  applyUpdateRoom,
  BattleParticipant,
  BattleRoomState,
  BattleTimeLimitType,
  validateJoin,
  validateUpdateRoom,
} from './battle-state';

@Injectable()
@WebSocketGateway({ namespace: '/battle' })
export class BattleGateway {
  @WebSocketServer()
  private readonly server!: Server;

  constructor(private readonly battleService: BattleService) {}

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

    this.battleService.saveRoom(nextRoom);
    client.join(nextRoom.roomId);
    this.server.to(nextRoom.roomId).emit('battle:participantsUpdated', {
      roomId: nextRoom.roomId,
      participants: nextRoom.participants,
    });
  }

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

  @SubscribeMessage('battle:updateRoom')
  handleUpdateRoom(
    @MessageBody()
    payload: {
      roomId: string;
      fieldId: number;
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
      fieldId: payload.fieldId,
      maxPlayers: payload.maxPlayers,
      timeLimitType: payload.timeLimitType,
      timeLimitSeconds,
    });

    this.battleService.saveRoom(nextRoom);
    this.server.to(nextRoom.roomId).emit('battle:roomUpdated', {
      roomId: nextRoom.roomId,
      fieldId: nextRoom.settings.fieldId,
      maxPlayers: nextRoom.settings.maxPlayers,
      timeLimitType: nextRoom.settings.timeLimitType,
    });
  }

  @SubscribeMessage('battle:start')
  handleStart(@MessageBody() payload: { roomId: string }): void {
    void payload;
  }

  @SubscribeMessage('battle:restart')
  handleRestart(@MessageBody() payload: { roomId: string }): void {
    void payload;
  }

  @SubscribeMessage('battle:submitAnswer')
  handleSubmitAnswer(
    @MessageBody() payload: { roomId: string; quizId: number; answer: unknown },
  ): void {
    void payload;
  }

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

  private getTimeLimitSeconds(timeLimitType: string): number {
    if (timeLimitType === 'relaxed') {
      return 25;
    }

    if (timeLimitType === 'fast') {
      return 10;
    }

    return 15;
  }
}
