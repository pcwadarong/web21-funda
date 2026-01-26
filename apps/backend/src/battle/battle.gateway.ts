import { Injectable } from '@nestjs/common';
import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

import { BattleService } from './battle.service';

@Injectable()
@WebSocketGateway({ namespace: '/battle' })
export class BattleGateway {
  constructor(private readonly battleService: BattleService) {}

  @SubscribeMessage('battle:join')
  handleJoin(@MessageBody() payload: { roomId: string }): void {
    void payload;
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
}
