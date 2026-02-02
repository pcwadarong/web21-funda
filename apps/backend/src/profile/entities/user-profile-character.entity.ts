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

import { ProfileCharacter } from './profile-character.entity';

@Entity({ name: 'user_profile_characters' })
@Index('IDX_user_profile_characters_user_character_unique', ['userId', 'characterId'], {
  unique: true,
})
@Index('IDX_user_profile_characters_user', ['userId'])
@Index('IDX_user_profile_characters_character', ['characterId'])
export class UserProfileCharacter {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'character_id', type: 'int' })
  characterId!: number;

  @ManyToOne(() => ProfileCharacter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'character_id' })
  character!: ProfileCharacter;

  @CreateDateColumn({ name: 'purchased_at', type: 'datetime' })
  purchasedAt!: Date;
}
