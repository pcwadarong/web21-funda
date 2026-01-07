import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Unit } from './unit.entity';

@Entity({ name: 'fields' })
@Index('IDX_fields_slug_unique', ['slug'], { unique: true })
export class Field {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 100 })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @OneToMany(() => Unit, unit => unit.field)
  units?: Unit[];
}
