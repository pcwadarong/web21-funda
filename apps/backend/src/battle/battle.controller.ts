import { randomUUID } from 'crypto';

import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';

import {
  CreateBattleRoomRequest,
  CreateBattleRoomResponse,
  JoinBattleRoomRequest,
  JoinBattleRoomResponse,
} from './dto/battle-room.dto';
import { BattleService } from './battle.service';
import { createBattleRoomState } from './battle-state';

@Controller('battles')
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  /**
   * 배틀 방을 생성하고 초대 토큰을 발급한다.
   *
   * @param body 방 생성 요청 데이터
   * @returns 방 ID와 초대 토큰
   */
  @Post('rooms')
  createRoom(@Body() body: CreateBattleRoomRequest): CreateBattleRoomResponse {
    const roomId = this.createRoomId();
    const inviteToken = this.createInviteToken();

    const fieldSlug = body.fieldSlug ?? 'cs';
    const maxPlayers = body.maxPlayers ?? 5;
    const timeLimitType = body.timeLimitType ?? 'recommended';

    const roomState = createBattleRoomState({
      roomId,
      hostParticipantId: '',
      settings: {
        fieldSlug,
        maxPlayers,
        timeLimitType,
        timeLimitSeconds: this.getTimeLimitSeconds(timeLimitType),
      },
      inviteToken,
      totalQuizzes: 10,
    });

    this.battleService.saveRoom(roomState);

    return {
      roomId,
      inviteToken,
    };
  }

  /**
   * 초대 토큰으로 참가 가능 여부를 확인한다.
   *
   * @param body 초대 토큰 정보
   * @returns 참가 가능 여부와 방 ID
   */
  @Post('rooms/join')
  joinRoom(@Body() body: JoinBattleRoomRequest): JoinBattleRoomResponse {
    const room = this.findRoomByInviteToken(body.inviteToken);
    if (!room) {
      throw new HttpException('방을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    if (room.status !== 'waiting') {
      return {
        roomId: room.roomId,
        canJoin: false,
        settings: room.settings,
      };
    }

    return {
      roomId: room.roomId,
      canJoin: true,
      settings: room.settings,
    };
  }

  /**
   * 초대 토큰으로 방을 조회한다.
   *
   * @param inviteToken 초대 토큰
   * @returns 방 상태
   */
  private findRoomByInviteToken(inviteToken: string): ReturnType<BattleService['getRoom']> {
    const rooms = this.battleService.getAllRooms();
    return rooms.find(room => room.inviteToken === inviteToken) ?? null;
  }

  /**
   * 방 ID를 생성한다.
   *
   * @returns 방 ID
   */
  private createRoomId(): string {
    return `room_${Math.random().toString(36).slice(2, 10)}`;
  }

  /**
   * 초대 토큰을 생성한다.
   *
   * @returns 초대 토큰
   */
  private createInviteToken(): string {
    return randomUUID().split('-')[0] ?? '';
  }

  /**
   * 제한 시간 타입에 따른 초 단위 값을 반환한다.
   *
   * @param timeLimitType 제한 시간 타입
   * @returns 제한 시간(초)
   */
  private getTimeLimitSeconds(timeLimitType: CreateBattleRoomRequest['timeLimitType']): number {
    if (timeLimitType === 'relaxed') {
      return 25;
    }

    if (timeLimitType === 'fast') {
      return 10;
    }

    return 15;
  }
}
