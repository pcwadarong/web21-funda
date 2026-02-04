import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateEmailSubscriptionDto {
  @ApiProperty({ description: '이메일 알림 수신 여부', example: true })
  @IsBoolean()
  isEmailSubscribed!: boolean;
}
