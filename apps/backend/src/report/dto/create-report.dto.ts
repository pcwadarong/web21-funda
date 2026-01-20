import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({
    description: '퀴즈 신고 사유',
    enum: ['문제가 보이지않아요', '정답이 잘못된 것 같아요', '문제/해설에 오타가 있어요', '기타'],
    example: '문제/해설에 오타가 있어요',
  })
  @IsString()
  @IsNotEmpty()
  report_description!: string;
}
