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

import { Quiz } from '../../roadmap/entities/quiz.entity';

@Entity({ name: 'solve_logs' })
@Index('IDX_solve_logs_user', ['userId'])
export class SolveLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: number;

  @ManyToOne(() => Quiz, quiz => quiz.solveLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz!: Quiz;

  @RelationId((log: SolveLog) => log.quiz)
  quizId!: number;

  @Column({ name: 'is_correct', type: 'boolean' })
  isCorrect!: boolean;

  @Column({ name: 'solved_at', type: 'datetime' })
  solvedAt!: Date;

  @Column({ type: 'int', nullable: true })
  duration?: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
