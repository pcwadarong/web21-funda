import { Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';

import { Quiz } from './quiz.entity';
import { Step } from './step.entity';

@Entity({ name: 'checkpoint_quiz_pools' })
@Index('IDX_checkpoint_quiz_pool_unique', ['checkpointStep', 'quiz'], { unique: true })
export class CheckpointQuizPool {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Step, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'checkpoint_step_id' })
  checkpointStep!: Step;

  @RelationId((pool: CheckpointQuizPool) => pool.checkpointStep)
  checkpointStepId!: number;

  @ManyToOne(() => Quiz, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz!: Quiz;

  @RelationId((pool: CheckpointQuizPool) => pool.quiz)
  quizId!: number;
}
