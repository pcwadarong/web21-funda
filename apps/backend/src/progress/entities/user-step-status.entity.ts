import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';

import { Step } from '../../roadmap/entities/step.entity';

@Entity({ name: 'user_step_statuses' })
@Index('IDX_user_step_status_user_step_unique', ['userId', 'step'], { unique: true })
export class UserStepStatus {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: number;

  @ManyToOne(() => Step, step => step.stepStatuses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'step_id' })
  step!: Step;

  @RelationId((status: UserStepStatus) => status.step)
  stepId!: number;

  @Column({ name: 'is_completed', type: 'boolean', default: false })
  isCompleted!: boolean;

  @Column({ name: 'best_score', type: 'int', nullable: true })
  bestScore?: number | null;
}
