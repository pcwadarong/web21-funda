import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';

import { Field } from './field.entity';
import { Step } from './step.entity';

@Entity({ name: 'units' })
@Index('IDX_units_field_title_unique', ['field', 'title'], { unique: true })
export class Unit {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Field, field => field.units, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'field_id' })
  field!: Field;

  @RelationId((unit: Unit) => unit.field)
  fieldId!: number;

  @Column({ length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'text', nullable: true })
  overview?: string | null;

  @Column({ name: 'order_index', type: 'int' })
  orderIndex!: number;

  @OneToMany(() => Step, step => step.unit)
  steps?: Step[];

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
