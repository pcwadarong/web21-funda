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

import { RankingTier } from './ranking-tier.entity';
import { RankingWeek } from './ranking-week.entity';

@Entity({ name: 'ranking_groups' })
@Index('IDX_ranking_groups_week_tier_group_unique', ['weekId', 'tierId', 'groupIndex'], {
  unique: true,
})
export class RankingGroup {
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

  @Column({ name: 'group_index', type: 'int' })
  groupIndex!: number;

  @Column({ type: 'int' })
  capacity!: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
