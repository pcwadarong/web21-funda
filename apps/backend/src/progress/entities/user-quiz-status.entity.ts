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

export enum QuizLearningStatus {
  LEARNING = 'learning',
  REVIEW = 'review',
  MASTERED = 'mastered',
}

@Entity({ name: 'user_quiz_statuses' })
@Index('IDX_user_quiz_status_user_quiz_unique', ['userId', 'quiz'], { unique: true })
@Index('IDX_user_quiz_status_user_next_review', ['userId', 'nextReviewAt'])
export class UserQuizStatus {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: number;

  @ManyToOne(() => Quiz, quiz => quiz.userStatuses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz!: Quiz;

  @RelationId((status: UserQuizStatus) => status.quiz)
  quizId!: number;

  @Column({ type: 'enum', enum: QuizLearningStatus, default: QuizLearningStatus.LEARNING })
  status!: QuizLearningStatus;

  @Column({ type: 'int', default: 0 })
  interval!: number;

  @Column({ name: 'ease_factor', type: 'float', default: 2.5 })
  easeFactor!: number;

  @Column({ type: 'int', default: 0 })
  repetition!: number;

  @Column({ name: 'last_quality', type: 'int', nullable: true })
  lastQuality?: number | null;

  @Column({ name: 'review_count', type: 'int', default: 0 })
  reviewCount!: number;

  @Column({ name: 'lapse_count', type: 'int', default: 0 })
  lapseCount!: number;

  @Column({ name: 'next_review_at', type: 'datetime', nullable: true })
  nextReviewAt?: Date | null;

  @Column({ name: 'last_solved_at', type: 'datetime', nullable: true })
  lastSolvedAt?: Date | null;

  @Column({ name: 'is_wrong', type: 'boolean', default: false })
  isWrong!: boolean;

  @Column({ name: 'is_dont_know', type: 'boolean', default: false })
  isDontKnow!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
