import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity({ name: 'user_refresh_tokens' })
@Index('IDX_refresh_token_hash_unique', ['tokenHash'], { unique: true })
@Index('IDX_refresh_token_user', ['userId'])
export class UserRefreshToken {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ManyToOne(() => User, user => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @RelationId((token: UserRefreshToken) => token.user)
  @Column({ name: 'user_id', type: 'bigint' })
  userId!: number;

  // 토큰 원문 대신 해쉬 사용
  @Column({ name: 'token_hash', type: 'varchar', length: 255 })
  tokenHash!: string;

  @Column({ name: 'issued_at', type: 'datetime' })
  issuedAt!: Date;

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt!: Date;

  @Column({ name: 'revoked_at', type: 'datetime', nullable: true })
  revokedAt?: Date | null;

  // 토큰 재사용 감지(Replay) 시점을 추적하기 위해 마지막 사용 시각을 기록한다.
  @Column({ name: 'last_used_at', type: 'datetime', nullable: true })
  lastUsedAt?: Date | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  userAgent?: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
