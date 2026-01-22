import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

import { RankingTier } from './ranking-tier.entity';
import { RankingTierChangeReason } from './ranking-tier-change-reason.enum';
import { RankingWeek } from './ranking-week.entity';

@Entity({ name: 'ranking_tier_change_histories' })
@Index('IDX_ranking_tier_change_histories_week_user', ['weekId', 'userId'])
export class RankingTierChangeHistory {
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

  @Column({ name: 'from_tier_id', type: 'int', nullable: true })
  fromTierId?: number | null;

  @ManyToOne(() => RankingTier, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'from_tier_id' })
  fromTier?: RankingTier | null;

  @Column({ name: 'to_tier_id', type: 'int', nullable: true })
  toTierId?: number | null;

  @ManyToOne(() => RankingTier, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'to_tier_id' })
  toTier?: RankingTier | null;

  @Column({ type: 'enum', enum: RankingTierChangeReason })
  reason!: RankingTierChangeReason;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;
}
