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

@Entity({ name: 'user_follows' })
@Index('IDX_user_follows_follower_following_unique', ['followerId', 'followingId'], {
  unique: true,
})
@Index('IDX_user_follows_follower', ['followerId'])
@Index('IDX_user_follows_following', ['followingId'])
export class UserFollow {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'follower_id', type: 'bigint' })
  followerId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_id' })
  follower!: User;

  @Column({ name: 'following_id', type: 'bigint' })
  followingId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'following_id' })
  following!: User;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;
}
