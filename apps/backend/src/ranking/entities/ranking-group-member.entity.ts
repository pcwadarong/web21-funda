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

import { RankingGroup } from './ranking-group.entity';
import { RankingTier } from './ranking-tier.entity';
import { RankingWeek } from './ranking-week.entity';

@Entity({ name: 'ranking_group_members' })
@Index('IDX_ranking_group_members_week_user_unique', ['weekId', 'userId'], { unique: true })
@Index('IDX_ranking_group_members_group', ['groupId'])
export class RankingGroupMember {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ name: 'week_id', type: 'int' })
  weekId!: number;

  @ManyToOne(() => RankingWeek, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'week_id' })
  week!: RankingWeek;

  @Column({ name: 'tier_id', type: 'int' })
  tierId!: number;

  @ManyToOne(() => RankingTier, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tier_id' })
  tier!: RankingTier;

  @Column({ name: 'group_id', type: 'int' })
  groupId!: number;

  @ManyToOne(() => RankingGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group!: RankingGroup;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'joined_at', type: 'datetime' })
  joinedAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
