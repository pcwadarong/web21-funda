import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserProfileCharacter } from './user-profile-character.entity';

@Entity({ name: 'profile_characters' })
export class ProfileCharacter {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500 })
  imageUrl!: string;

  @Column({ name: 'price_diamonds', type: 'int' })
  priceDiamonds!: number;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;

  @OneToMany(() => UserProfileCharacter, ownership => ownership.character)
  owners?: UserProfileCharacter[];
}
