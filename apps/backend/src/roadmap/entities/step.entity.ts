import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';

import { UserStepStatus } from '../../progress/entities/user-step-status.entity';

import { Quiz } from './quiz.entity';
import { Unit } from './unit.entity';

const successRateTransformer = {
  to: (value?: number | null) => value ?? null,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity({ name: 'steps' })
@Index('IDX_steps_unit_title_unique', ['unit', 'title'], { unique: true })
export class Step {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Unit, unit => unit.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'unit_id' })
  unit!: Unit;

  @RelationId((step: Step) => step.unit)
  unitId!: number;

  @Column({ length: 200 })
  title!: string;

  @Column({ name: 'order_index', type: 'int' })
  orderIndex!: number;

  @Column({ name: 'is_checkpoint', type: 'boolean', default: false })
  isCheckpoint!: boolean;

  @Column({ name: 'is_completed', type: 'boolean', default: false })
  isCompleted!: boolean;

  @Column({
    name: 'success_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: successRateTransformer,
  })
  successRate?: number | null;

  @OneToMany(() => Quiz, quiz => quiz.step)
  quizzes?: Quiz[];

  @OneToMany(() => UserStepStatus, status => status.step)
  stepStatuses?: UserStepStatus[];
}
