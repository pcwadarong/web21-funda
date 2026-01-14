import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'quiz_id', type: 'int' })
  quizId!: number;

  @Column({ name: 'report_description', type: 'varchar', length: 1000 })
  report_description!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
