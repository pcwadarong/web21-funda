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

import { RankingRewardType } from './ranking-reward-type.enum';
import { RankingTier } from './ranking-tier.entity';
import { RankingWeek } from './ranking-week.entity';

@Entity({ name: 'ranking_reward_histories' })
@Index('IDX_ranking_reward_histories_week_user', ['weekId', 'userId'])
export class RankingRewardHistory {
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

  @Column({ name: 'reward_type', type: 'enum', enum: RankingRewardType })
  rewardType!: RankingRewardType;

  @Column({ type: 'int' })
  amount!: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;
}
