import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SolveLog } from '../progress/entities/solve-log.entity';
import { StepAttemptStatus, UserStepAttempt } from '../progress/entities/user-step-attempt.entity';
import { Field } from '../roadmap/entities/field.entity';
import { User } from '../users/entities/user.entity';

import type {
  DailyStatsResult,
  FieldDailyStatsItem,
  FieldDailyStatsResult,
  FollowStateResult,
  ProfileFollowUser,
  ProfileStreakDay,
  ProfileSummaryResult,
  ProfileTierSummary,
} from './dto/profile.dto';
import { UserFollow } from './entities/user-follow.entity';
import { getDateRange, getLast7Days } from './utils/date.utils';

interface SolveStatsResult {
  totalStudyTimeSeconds: number;
  totalStudyTimeMinutes: number;
  solvedQuizzesCount: number;
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
    @InjectRepository(Field)
    private readonly fieldRepository: Repository<Field>,
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
      solvedQuizzesCount: solveStats.solvedQuizzesCount,
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
    });

    const followers: ProfileFollowUser[] = [];

    for (const follow of follows) {
      const followerUser = follow.follower;
      if (!followerUser) {
        continue;
      }

      followers.push(this.buildFollowUserSummary(followerUser));
    }

    return this.sortFollowUsersByName(followers);
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
    });

    const followingUsers: ProfileFollowUser[] = [];

    for (const follow of follows) {
      const followingUser = follow.following;
      if (!followingUser) {
        continue;
      }

      followingUsers.push(this.buildFollowUserSummary(followingUser));
    }

    return this.sortFollowUsersByName(followingUsers);
  }

  /**
   * 기간별 스트릭 데이터를 조회한다.
   *
   * @param {number} userId 조회 대상 사용자 ID
   * @returns {Promise<ProfileStreakDay[]>} 스트릭 일자별 데이터
   */
  async getStreaks(userId: number): Promise<ProfileStreakDay[]> {
    await this.ensureUserExists(userId);

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const rawRows = await this.solveLogRepository
      .createQueryBuilder('solve')
      .select('DATE(solve.solvedAt)', 'date')
      .addSelect('COUNT(*)', 'solvedCount')
      .where('solve.userId = :userId', { userId })
      .andWhere('solve.solvedAt >= :startOfYear', { startOfYear })
      .andWhere('solve.solvedAt <= :now', { now })
      .groupBy('DATE(solve.solvedAt)')
      .orderBy('DATE(solve.solvedAt)', 'ASC')
      .getRawMany<{ date: string; solvedCount: string }>();

    return rawRows.map(row => ({
      userId,
      date: row.date,
      solvedCount: Number(row.solvedCount),
    }));
  }

  /**
   * 최근 7일간의 날짜별 학습 시간을 조회한다.
   *
   * @param {number} userId 조회 대상 사용자 ID
   * @returns {Promise<DailyStatsResult>} 최근 7일간 일일 통계 데이터
   */
  async getDailyStats(userId: number): Promise<DailyStatsResult> {
    await this.ensureUserExists(userId);

    const allDates = getLast7Days();
    const { startDate, endDate } = getDateRange(allDates);

    // stepAttemptRepository에서 최근 7일간의 학습 시간 조회
    const studyTimeRows = await this.stepAttemptRepository
      .createQueryBuilder('stepAttempt')
      .select('DATE(stepAttempt.finishedAt)', 'date')
      .addSelect(
        'COALESCE(SUM(TIMESTAMPDIFF(SECOND, stepAttempt.startedAt, stepAttempt.finishedAt)), 0)',
        'studySeconds',
      )
      .where('stepAttempt.userId = :userId', { userId })
      .andWhere('stepAttempt.status = :status', { status: StepAttemptStatus.COMPLETED })
      .andWhere('stepAttempt.finishedAt IS NOT NULL')
      .andWhere('DATE(stepAttempt.finishedAt) >= :startDate', { startDate })
      .andWhere('DATE(stepAttempt.finishedAt) <= :endDate', { endDate })
      .groupBy('DATE(stepAttempt.finishedAt)')
      .orderBy('DATE(stepAttempt.finishedAt)', 'ASC')
      .getRawMany<{ date: string; studySeconds: string | number }>();

    // 날짜별로 맵 생성
    const studyTimeMap = new Map<string, number>();
    studyTimeRows.forEach(row => {
      studyTimeMap.set(row.date, Number(row.studySeconds));
    });

    // 모든 날짜에 대해 데이터 생성
    const dailyData = allDates.map(date => ({
      date,
      studySeconds: studyTimeMap.get(date) ?? 0,
    }));

    // 최대 학습 시간 계산
    const periodMaxSeconds = Math.max(...dailyData.map(d => d.studySeconds), 0);

    // 평균 학습 시간 계산
    const totalSeconds = dailyData.reduce((sum, d) => sum + d.studySeconds, 0);
    const periodAverageSeconds =
      dailyData.length > 0 ? Math.floor(totalSeconds / dailyData.length) : 0;

    return {
      dailyData,
      periodMaxSeconds,
      periodAverageSeconds,
    };
  }

  /**
   * 최근 7일간 필드(로드맵)별 문제 풀이 수를 조회한다.
   *
   * @param {number} userId 조회 대상 사용자 ID
   * @returns {Promise<FieldDailyStatsResult>} 필드별 최근 7일 통계
   */
  async getFieldDailyStats(userId: number): Promise<FieldDailyStatsResult> {
    await this.ensureUserExists(userId);

    const allDates = getLast7Days();
    const { startDate, endDate } = getDateRange(allDates);

    const roadmapFields = await this.fieldRepository.find({
      select: ['id', 'name', 'slug'],
      order: { id: 'ASC' },
    });

    // solveLog 테이블에서 최근 7일간의 필드별 문제 풀이 수를 조회한다.
    const rows = await this.solveLogRepository
      .createQueryBuilder('solveLog')
      .innerJoin('solveLog.quiz', 'quiz')
      .innerJoin('quiz.step', 'step')
      .innerJoin('step.unit', 'unit')
      .innerJoin('unit.field', 'field')
      .select('field.id', 'fieldId')
      .addSelect('field.name', 'fieldName')
      .addSelect('field.slug', 'fieldSlug')
      .addSelect('DATE(solveLog.solvedAt)', 'date')
      .addSelect(
        'COALESCE(SUM(CASE WHEN solveLog.isCorrect = true THEN 1 ELSE 0 END), 0)',
        'solvedCount',
      )
      .where('solveLog.userId = :userId', { userId })
      .andWhere('DATE(solveLog.solvedAt) >= :startDate', { startDate })
      .andWhere('DATE(solveLog.solvedAt) <= :endDate', { endDate })
      .groupBy('field.id')
      .addGroupBy('DATE(solveLog.solvedAt)')
      .orderBy('field.id', 'ASC')
      .addOrderBy('DATE(solveLog.solvedAt)', 'ASC')
      .getRawMany<{
        fieldId: string | number;
        fieldName: string;
        fieldSlug: string;
        date: string;
        solvedCount: string | number;
      }>();

    const fieldMap = new Map<number, FieldDailyStatsItem>();

    // roadmapFields 목록을 순회하며 필드별 데이터를 초기화한다.
    roadmapFields.forEach(field => {
      fieldMap.set(field.id, {
        fieldId: field.id,
        fieldName: field.name,
        fieldSlug: field.slug,
        dailyData: allDates.map(date => ({ date, solvedCount: 0 })),
        periodMaxSolvedCount: 0,
        periodAverageSolvedCount: 0,
        totalSolvedCount: 0,
      });
    });

    // rows 목록을 순회하며 필드별 데이터를 업데이트한다.
    rows.forEach(row => {
      const fieldId = Number(row.fieldId);
      const solvedCount = Number(row.solvedCount);
      let fieldEntry = fieldMap.get(fieldId);

      if (!fieldEntry) {
        fieldEntry = {
          fieldId,
          fieldName: row.fieldName,
          fieldSlug: row.fieldSlug,
          dailyData: allDates.map(date => ({ date, solvedCount: 0 })),
          periodMaxSolvedCount: 0,
          periodAverageSolvedCount: 0,
          totalSolvedCount: 0,
        };
        fieldMap.set(fieldId, fieldEntry);
      }

      const dailyItem = fieldEntry.dailyData.find(item => item.date === row.date);
      if (dailyItem) {
        dailyItem.solvedCount = solvedCount;
      }
    });

    // fieldMap 목록을 순회하며 필드별 데이터를 계산한다.
    const fields = Array.from(fieldMap.values()).map(fieldEntry => {
      const totalSolvedCount = fieldEntry.dailyData.reduce(
        (sum, item) => sum + item.solvedCount,
        0,
      );
      const periodMaxSolvedCount = Math.max(
        ...fieldEntry.dailyData.map(item => item.solvedCount),
        0,
      );
      const periodAverageSolvedCount =
        fieldEntry.dailyData.length > 0
          ? Math.floor(totalSolvedCount / fieldEntry.dailyData.length)
          : 0;

      return {
        ...fieldEntry,
        totalSolvedCount,
        periodMaxSolvedCount,
        periodAverageSolvedCount,
      };
    });

    return { fields };
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

  /**
   * 팔로우 목록을 이름 기준으로 정렬한다.
   *
   * - 영문 이름은 알파벳 순으로 먼저 배치한다.
   * - 한글 이름은 영문 다음 순서로 배치한다.
   * - 그 외 문자는 가장 마지막에 배치한다.
   *
   * @param {ProfileFollowUser[]} users 정렬할 사용자 목록
   * @returns {ProfileFollowUser[]} 정렬된 사용자 목록
   */
  private sortFollowUsersByName(users: ProfileFollowUser[]): ProfileFollowUser[] {
    const collatorEnglish = new Intl.Collator('en', { sensitivity: 'base' });
    const collatorKorean = new Intl.Collator('ko', { sensitivity: 'base' });
    const sortedUsers = [...users];

    sortedUsers.sort((leftUser, rightUser) => {
      const leftGroup = this.getDisplayNameGroup(leftUser.displayName);
      const rightGroup = this.getDisplayNameGroup(rightUser.displayName);

      if (leftGroup !== rightGroup) {
        return leftGroup - rightGroup;
      }

      if (leftGroup === 0) {
        return collatorEnglish.compare(leftUser.displayName, rightUser.displayName);
      }

      if (leftGroup === 1) {
        return collatorKorean.compare(leftUser.displayName, rightUser.displayName);
      }

      return leftUser.displayName.localeCompare(rightUser.displayName);
    });

    return sortedUsers;
  }

  private getDisplayNameGroup(displayName: string): number {
    const firstChar = displayName.trim().charAt(0);

    if (!firstChar) {
      return 2;
    }

    if (this.isEnglishCharacter(firstChar)) {
      return 0;
    }

    if (this.isKoreanCharacter(firstChar)) {
      return 1;
    }

    return 2;
  }

  private isEnglishCharacter(character: string): boolean {
    return /[A-Za-z]/.test(character);
  }

  private isKoreanCharacter(character: string): boolean {
    return /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(character);
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
    const solvedQuizzesCount = Number(rawStats?.solvedCount ?? 0);
    const totalStudyTimeMinutes = Math.floor(totalStudyTimeSeconds / 60);

    return {
      totalStudyTimeSeconds,
      totalStudyTimeMinutes,
      solvedQuizzesCount,
    };
  }
}
