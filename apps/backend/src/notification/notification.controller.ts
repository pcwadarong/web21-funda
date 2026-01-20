import { Body, Controller, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

import { NotificationService } from './notification.service';

class UnsubscribeDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * 이메일 구독 해지 API
   */
  @Patch('unsubscribe')
  @ApiOperation({
    summary: '이메일 구독 해지',
    description: '리마인드 이메일 수신을 거부한다.',
  })
  @ApiBody({
    type: UnsubscribeDto,
    description: '수신 거부할 유저의 이메일 주소',
    examples: {
      example1: {
        value: { email: 'user@example.com' },
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
    description: '잘못된 요청(이메일 누락 등)입니다.',
  })
  async unsubscribe(@Body() unsubscribeDto: UnsubscribeDto) {
    const { email } = unsubscribeDto;
    if (!email) return { success: false, message: 'Email is required' };
    return this.notificationService.unsubscribeUser(email);
  }
}
