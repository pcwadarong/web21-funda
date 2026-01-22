import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RankingTierName } from './ranking-tier.enum';

@Entity({ name: 'ranking_tiers' })
@Index('IDX_ranking_tiers_name_unique', ['name'], { unique: true })
export class RankingTier {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'enum', enum: RankingTierName })
  name!: RankingTierName;

  @Column({ name: 'order_index', type: 'int' })
  orderIndex!: number;

  @Column({ name: 'max_group_size', type: 'int', default: 10 })
  maxGroupSize!: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
