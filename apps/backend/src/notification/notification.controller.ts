import { Body, Controller, Patch } from '@nestjs/common';

import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * 이메일 구독 해지 API
   */
  @Patch('unsubscribe')
  async unsubscribe(@Body('email') email: string) {
    if (!email) return { success: false, message: 'Email is required' };
    return this.notificationService.unsubscribeUser(email);
  }
}
