import { ApiProperty } from '@nestjs/swagger';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export const REPORT_REASONS = [
  '문제가 보이지않아요',
  '정답이 잘못된 것 같아요',
  '문제/해설에 오타가 있어요',
  '기타',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

@ValidatorConstraint({ name: 'isValidReportDescription', async: false })
export class IsValidReportDescriptionConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    // 1. 타입 및 기본 빈 값 검증 (이 로직이 IsNotEmpty를 대체함)
    if (typeof value !== 'string') return false;

    // 2. 의미 있는 문자열 추출 (쉼표만 있는 경우 ", , ," 방지)
    const hasContent = value.split(',').some(part => part.trim().length > 0);

    return hasContent;
  }

  defaultMessage(): string {
    return '신고 사유를 선택하거나 내용을 입력해주세요.';
  }
}

export function IsValidReportDescription(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidReportDescriptionConstraint,
    });
  };
}

export class CreateReportDto {
  @ApiProperty({
    description: '퀴즈 신고 사유 (제공된 옵션 선택 또는 자유 텍스트 입력)',
    enum: REPORT_REASONS,
    example: '문제/해설에 오타가 있어요',
  })
  @IsValidReportDescription()
  report_description!: string;
}
