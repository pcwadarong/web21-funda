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

import { RankingGroup } from './ranking-group.entity';
import { RankingSnapshotStatus } from './ranking-snapshot-status.enum';
import { RankingTier } from './ranking-tier.entity';
import { RankingWeek } from './ranking-week.entity';

@Entity({ name: 'ranking_weekly_snapshots' })
@Index('IDX_ranking_weekly_snapshots_week_user_unique', ['weekId', 'userId'], { unique: true })
@Index('IDX_ranking_weekly_snapshots_group', ['groupId'])
export class RankingWeeklySnapshot {
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

  @Column({ type: 'int' })
  rank!: number;

  @Column({ type: 'int' })
  xp!: number;

  @Column({ type: 'enum', enum: RankingSnapshotStatus })
  status!: RankingSnapshotStatus;

  @Column({ name: 'promote_cut_xp', type: 'int', nullable: true })
  promoteCutXp?: number | null;

  @Column({ name: 'demote_cut_xp', type: 'int', nullable: true })
  demoteCutXp?: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;
}
