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

@Entity({ name: 'ranking_tier_rules' })
@Index('IDX_ranking_tier_rules_tier_unique', ['tierId'], { unique: true })
export class RankingTierRule {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ name: 'tier_id', type: 'int' })
  tierId!: number;

  @ManyToOne(() => RankingTier, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tier_id' })
  tier!: RankingTier;

  @Column({ name: 'promote_min_xp', type: 'int' })
  promoteMinXp!: number;

  @Column({ name: 'demote_min_xp', type: 'int' })
  demoteMinXp!: number;

  @Column({ name: 'promote_ratio', type: 'decimal', precision: 5, scale: 4 })
  promoteRatio!: string;

  @Column({ name: 'demote_ratio', type: 'decimal', precision: 5, scale: 4 })
  demoteRatio!: string;

  @Column({ name: 'is_master', type: 'boolean', default: false })
  isMaster!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
