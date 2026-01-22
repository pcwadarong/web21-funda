import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RankingWeekStatus } from './ranking-week-status.enum';

@Entity({ name: 'ranking_weeks' })
@Index('IDX_ranking_weeks_week_key_unique', ['weekKey'], { unique: true })
export class RankingWeek {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ name: 'week_key', type: 'varchar', length: 10 })
  weekKey!: string;

  @Column({ name: 'starts_at', type: 'datetime' })
  startsAt!: Date;

  @Column({ name: 'ends_at', type: 'datetime' })
  endsAt!: Date;

  @Column({ type: 'enum', enum: RankingWeekStatus })
  status!: RankingWeekStatus;

  @Column({ name: 'evaluated_at', type: 'datetime', nullable: true })
  evaluatedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
