import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

import { RankingTier } from './ranking-tier.entity';
import { RankingWeek } from './ranking-week.entity';

@Entity({ name: 'ranking_weekly_xp' })
@Index('IDX_ranking_weekly_xp_week_user_unique', ['weekId', 'userId'], { unique: true })
export class RankingWeeklyXp {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ name: 'week_id', type: 'int' })
  weekId!: number;

  @ManyToOne(() => RankingWeek, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'week_id' })
  week!: RankingWeek;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'tier_id', type: 'int' })
  tierId!: number;

  @ManyToOne(() => RankingTier, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tier_id' })
  tier!: RankingTier;

  @Column({ type: 'int', default: 0 })
  xp!: number;

  @Column({ name: 'solved_count', type: 'int', default: 0 })
  solvedCount!: number;

  @Column({ name: 'first_solved_at', type: 'datetime', nullable: true })
  firstSolvedAt?: Date | null;

  @Column({ name: 'last_solved_at', type: 'datetime', nullable: true })
  lastSolvedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
