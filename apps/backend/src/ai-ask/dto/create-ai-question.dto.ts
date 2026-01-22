import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAiQuestionDto {
  @ApiProperty({
    description: 'AI에게 전달할 사용자 질문',
    example: '이 문제에서 O(1)로 풀 수 있는 이유가 뭐야?',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  question!: string;
}
