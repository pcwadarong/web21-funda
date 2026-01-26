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
import { applyJoin, BattleParticipant, validateJoin } from './battle-state';

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
  handleLeave(@MessageBody() payload: { roomId: string }): void {
    void payload;
  }

  @SubscribeMessage('battle:updateRoom')
  handleUpdateRoom(
    @MessageBody()
    payload: {
      roomId: string;
      fieldId: number;
      maxPlayers: number;
      timeLimitType: string;
    },
  ): void {
    void payload;
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
    const prefix = '펀다사용자';
    let index = 1;

    const existingNames = new Set(participants.map(participant => participant.displayName));

    while (existingNames.has(`${prefix}${index}`)) {
      index += 1;
    }

    return `${prefix}${index}`;
  }
}
