import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';

import { SolveLog } from '../../progress/entities/solve-log.entity';
import { UserQuizStatus } from '../../progress/entities/user-quiz-status.entity';

import { Step } from './step.entity';

@Entity({ name: 'quizzes' })
export class Quiz {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Step, step => step.quizzes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'step_id' })
  step!: Step;

  @RelationId((quiz: Quiz) => quiz.step)
  stepId!: number;

  @Column({ length: 50 })
  type!: string;

  @Column({ type: 'text' })
  question!: string;

  @Column({ type: 'json' })
  content!: Record<string, unknown>;

  @Column({ type: 'json' })
  answer!: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  explanation?: string | null;

  @Column({ type: 'int' })
  difficulty!: number;

  @OneToMany(() => UserQuizStatus, status => status.quiz)
  userStatuses?: UserQuizStatus[];

  @OneToMany(() => SolveLog, log => log.quiz)
  solveLogs?: SolveLog[];
}
