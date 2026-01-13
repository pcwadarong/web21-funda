import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class StartStepAttemptDto {
  @IsInt()
  userId!: number;

  @IsOptional()
  @IsDateString()
  startedAt?: string;
}
