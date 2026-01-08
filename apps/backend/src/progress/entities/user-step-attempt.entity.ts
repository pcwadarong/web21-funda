import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';

import { Step } from '../../roadmap/entities/step.entity';

export enum StepAttemptStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

const successRateTransformer = {
  to: (value?: number | null) => value ?? null,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity({ name: 'user_step_attempts' })
@Index('IDX_user_step_attempt_user_step_no_unique', ['userId', 'step', 'attemptNo'], {
  unique: true,
})
export class UserStepAttempt {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: number;

  @ManyToOne(() => Step, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'step_id' })
  step!: Step;

  @RelationId((attempt: UserStepAttempt) => attempt.step)
  stepId!: number;

  @Column({ name: 'attempt_no', type: 'int' })
  attemptNo!: number;

  @Column({ name: 'total_questions', type: 'int' })
  totalQuestions!: number;

  @Column({ name: 'answered_count', type: 'int', default: 0 })
  answeredCount!: number;

  @Column({ name: 'correct_count', type: 'int', default: 0 })
  correctCount!: number;

  @Column({
    name: 'success_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: successRateTransformer,
  })
  successRate?: number | null;

  @Column({
    type: 'enum',
    enum: StepAttemptStatus,
    default: StepAttemptStatus.IN_PROGRESS,
  })
  status!: StepAttemptStatus;

  @Column({ name: 'started_at', type: 'datetime' })
  startedAt!: Date;

  @Column({ name: 'finished_at', type: 'datetime', nullable: true })
  finishedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
