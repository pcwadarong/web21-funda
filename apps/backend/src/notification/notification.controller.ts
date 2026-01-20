import { Body, Controller, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { UnsubscribeDto } from './dto/unsubscribe.dto';
import { NotificationService } from './notification.service';

@ApiTags('Notification')
@Controller('notification')
@UseGuards(ThrottlerGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * 이메일 구독 해지 API
   */
  @Patch('unsubscribe')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 1분에 최대 5회 요청
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '이메일 구독 해지',
    description: '리마인드 이메일 수신을 거부한다. 이메일 링크에 포함된 토큰이 필요합니다.',
  })
  @ApiBody({
    type: UnsubscribeDto,
    description: '수신 거부할 유저의 이메일 주소와 토큰',
    examples: {
      example1: {
        value: { email: 'user@example.com', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
    },
  })
  @ApiOkResponse({
    description: '구독 해지 성공',
    schema: {
      example: { success: true, message: 'Successfully unsubscribed' },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청(이메일 또는 토큰 누락 등)입니다.',
  })
  @ApiUnauthorizedResponse({
    description: '토큰이 유효하지 않거나 만료되었습니다.',
  })
  async unsubscribe(@Body() unsubscribeDto: UnsubscribeDto) {
    const { email, token } = unsubscribeDto;

    // 토큰 검증
    await this.notificationService.verifyUnsubscribeToken(token, email);

    // 검증 성공 후 구독 해지
    await this.notificationService.unsubscribeUser(email);

    return { success: true, message: 'Successfully unsubscribed' };
  }
}
