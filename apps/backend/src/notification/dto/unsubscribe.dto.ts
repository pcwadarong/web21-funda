import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UnsubscribeDto {
  @ApiProperty({ description: '수신 거부 대상 이메일', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: '수신 거부 인증 토큰' })
  @IsString()
  @IsNotEmpty()
  token!: string;
}
