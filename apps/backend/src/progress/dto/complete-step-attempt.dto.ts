import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class CompleteStepAttemptDto {
  @IsInt()
  userId!: number;

  @IsOptional()
  @IsDateString()
  finishedAt?: string;
}
