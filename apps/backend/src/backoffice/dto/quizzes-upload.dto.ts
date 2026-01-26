import { ApiProperty } from '@nestjs/swagger';

export interface UploadedQuizFile {
  buffer: Buffer;
  originalname?: string;
  mimetype?: string;
  size?: number;
}

export interface QuizJsonlRow {
  field_slug: string;
  field_name: string;
  field_description?: string;
  unit_title: string;
  unit_description?: string;
  unit_order_index?: number;
  step_title: string;
  step_description?: string;
  step_order_index?: number;
  is_checkpoint?: boolean;
  step_is_checkpoint?: boolean;
  type: string;
  question: string;
  content: unknown;
  answer: unknown;
  explanation?: string;
  difficulty?: number;
}

export interface UploadSummary {
  processed: number;
  fieldsCreated: number;
  fieldsUpdated: number;
  unitsCreated: number;
  unitsUpdated: number;
  stepsCreated: number;
  stepsUpdated: number;
  quizzesCreated: number;
  quizzesUpdated: number;
}

export class QuizzesUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: '업로드할 JSONL 데이터 파일',
  })
  file!: UploadedQuizFile[];
}
