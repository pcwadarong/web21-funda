import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SolveLog } from '../progress/entities/solve-log.entity';
import { StepAttemptStatus, UserStepAttempt } from '../progress/entities/user-step-attempt.entity';
import { User } from '../users/entities/user.entity';

import type {
  FollowStateResult,
  ProfileFollowUser,
  ProfileSummaryResult,
  ProfileTierSummary,
} from './dto/profile.dto';
import { UserFollow } from './entities/user-follow.entity';

interface SolveStatsResult {
  totalStudyTimeSeconds: number;
  totalStudyTimeMinutes: number;
  solvedQuestionCount: number;
}

interface SolveStatsRawResult {
  totalDurationSeconds: string | number | null;
  solvedCount: string | number | null;
}

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SolveLog)
    private readonly solveLogRepository: Repository<SolveLog>,
    @InjectRepository(UserStepAttempt)
    private readonly stepAttemptRepository: Repository<UserStepAttempt>,
    @InjectRepository(UserFollow)
    private readonly followRepository: Repository<UserFollow>,
  ) {}

  /**
   * 프로필 요약 정보를 반환한다.
   *
   * @param {number} userId 조회 대상 사용자 ID
   * @returns {Promise<ProfileSummaryResult>} 프로필 요약 결과
   */
  async getProfileSummary(userId: number): Promise<ProfileSummaryResult> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { currentTier: true },
    });

    if (!user) {
      throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
    }

    const followerCount = await this.followRepository.count({
      where: { followingId: userId },
    });

    const followingCount = await this.followRepository.count({
      where: { followerId: userId },
    });

    const solveStats = await this.calculateSolveStats(userId);
    const tierSummary = this.buildTierSummary(user.currentTier ?? null);

    return {
      userId: user.id,
      displayName: user.displayName,
      profileImageUrl: user.profileImageUrl ?? null,
      experience: user.experience,
      currentStreak: user.currentStreak,
      tier: tierSummary,
      followerCount,
      followingCount,
      totalStudyTimeSeconds: solveStats.totalStudyTimeSeconds,
      totalStudyTimeMinutes: solveStats.totalStudyTimeMinutes,
      solvedQuestionCount: solveStats.solvedQuestionCount,
    };
  }

  /**
   * 팔로워 목록을 조회한다.
   *
   * @param {number} userId 조회 대상 사용자 ID
   * @returns {Promise<ProfileFollowUser[]>} 팔로워 목록
   */
  async getFollowers(userId: number): Promise<ProfileFollowUser[]> {
    await this.ensureUserExists(userId);

    const follows = await this.followRepository.find({
      where: { followingId: userId },
      relations: { follower: { currentTier: true } },
      order: { createdAt: 'DESC' },
    });

    const followers: ProfileFollowUser[] = [];

    for (const follow of follows) {
      const followerUser = follow.follower;
      if (!followerUser) {
        continue;
      }

      followers.push(this.buildFollowUserSummary(followerUser));
    }

    return followers;
  }

  /**
   * 팔로잉 목록을 조회한다.
   *
   * @param {number} userId 조회 대상 사용자 ID
   * @returns {Promise<ProfileFollowUser[]>} 팔로잉 목록
   */
  async getFollowing(userId: number): Promise<ProfileFollowUser[]> {
    await this.ensureUserExists(userId);

    const follows = await this.followRepository.find({
      where: { followerId: userId },
      relations: { following: { currentTier: true } },
      order: { createdAt: 'DESC' },
    });

    const followingUsers: ProfileFollowUser[] = [];

    for (const follow of follows) {
      const followingUser = follow.following;
      if (!followingUser) {
        continue;
      }

      followingUsers.push(this.buildFollowUserSummary(followingUser));
    }

    return followingUsers;
  }

  /**
   * 특정 사용자를 팔로우한다.
   *
   * @param {number} targetUserId 팔로우 대상 사용자 ID
   * @param {number} followerUserId 팔로우를 요청한 사용자 ID
   * @returns {Promise<FollowStateResult>} 팔로우 상태
   */
  async followUser(targetUserId: number, followerUserId: number): Promise<FollowStateResult> {
    this.ensureNotSelfFollow(targetUserId, followerUserId);
    await this.ensureUserExists(targetUserId);

    const existingFollow = await this.followRepository.findOne({
      where: { followerId: followerUserId, followingId: targetUserId },
    });

    if (existingFollow) {
      return { isFollowing: true };
    }

    const follow = this.followRepository.create({
      followerId: followerUserId,
      followingId: targetUserId,
    });

    await this.followRepository.save(follow);

    return { isFollowing: true };
  }

  /**
   * 특정 사용자를 언팔로우한다.
   *
   * @param {number} targetUserId 언팔로우 대상 사용자 ID
   * @param {number} followerUserId 언팔로우를 요청한 사용자 ID
   * @returns {Promise<FollowStateResult>} 팔로우 상태
   */
  async unfollowUser(targetUserId: number, followerUserId: number): Promise<FollowStateResult> {
    this.ensureNotSelfFollow(targetUserId, followerUserId);

    const existingFollow = await this.followRepository.findOne({
      where: { followerId: followerUserId, followingId: targetUserId },
    });

    if (!existingFollow) {
      return { isFollowing: false };
    }

    await this.followRepository.remove(existingFollow);

    return { isFollowing: false };
  }

  private async ensureUserExists(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
    }
  }

  private ensureNotSelfFollow(targetUserId: number, followerUserId: number): void {
    if (targetUserId === followerUserId) {
      throw new BadRequestException('자기 자신은 팔로우할 수 없습니다.');
    }
  }

  private buildTierSummary(tier: User['currentTier']): ProfileTierSummary | null {
    if (!tier) {
      return null;
    }

    return {
      id: tier.id,
      name: tier.name,
      orderIndex: tier.orderIndex,
    };
  }

  private buildFollowUserSummary(user: User): ProfileFollowUser {
    return {
      userId: user.id,
      displayName: user.displayName,
      profileImageUrl: user.profileImageUrl ?? null,
      experience: user.experience,
      tier: this.buildTierSummary(user.currentTier ?? null),
    };
  }

  private async calculateSolveStats(userId: number): Promise<SolveStatsResult> {
    const rawStats = await this.solveLogRepository
      .createQueryBuilder('solveLog')
      .select(
        'COALESCE(SUM(CASE WHEN solveLog.isCorrect = true THEN 1 ELSE 0 END), 0)',
        'solvedCount',
      )
      .where('solveLog.userId = :userId', { userId })
      .getRawOne<SolveStatsRawResult>();

    const rawDuration = await this.stepAttemptRepository
      .createQueryBuilder('stepAttempt')
      .select(
        'COALESCE(SUM(TIMESTAMPDIFF(SECOND, stepAttempt.startedAt, stepAttempt.finishedAt)), 0)',
        'totalDurationSeconds',
      )
      .where('stepAttempt.userId = :userId', { userId })
      .andWhere('stepAttempt.status = :status', { status: StepAttemptStatus.COMPLETED })
      .andWhere('stepAttempt.finishedAt IS NOT NULL')
      .getRawOne<SolveStatsRawResult>();

    const totalStudyTimeSeconds = Number(rawDuration?.totalDurationSeconds ?? 0);
    const solvedQuestionCount = Number(rawStats?.solvedCount ?? 0);
    const totalStudyTimeMinutes = Math.floor(totalStudyTimeSeconds / 60);

    return {
      totalStudyTimeSeconds,
      totalStudyTimeMinutes,
      solvedQuestionCount,
    };
  }
}
