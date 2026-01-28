import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export interface UnitOverviewResponse {
  unit: {
    id: number;
    title: string;
    overview: string | null;
  };
}

export class UpdateUnitOverviewDto {
  @ApiProperty({
    description: '학습 개요 마크다운',
    example: '### 학습 개요\n\n- 핵심 개념을 빠르게 정리합니다.',
  })
  @IsString()
  @MinLength(1)
  overview!: string;
}
