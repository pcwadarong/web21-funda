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
import { getDateRange, getLast7Days, toDateString } from './utils/date.utils';

/**
 * 통계 계산용 인터페이스
 */
interface SolveStatsResult {
  totalStudyTimeSeconds: number;
  totalStudyTimeMinutes: number;
  solvedQuizzesCount: number;
}

@Injectable()
export class ProfileService {
  // 정렬을 위한 Collator 객체는 매번 생성하지 않도록 상수로 관리 (성능 최적화)
  private static readonly COLLATOR_EN = new Intl.Collator('en', { sensitivity: 'base' });
  private static readonly COLLATOR_KO = new Intl.Collator('ko', { sensitivity: 'base' });

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
   * 사용자의 존재 여부를 확인하고 유저 객체를 반환한다.
   * 서비스 내에서 중복되는 NotFoundException 처리를 통합한다.
   */
  private async findUserOrThrow(userId: number, relations: object = {}): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations });
    if (!user) throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
    return user;
  }

  /**
   * 프로필 요약 정보를 반환한다.
   * Promise.all을 통해 독립적인 쿼리들을 병렬 처리하여 성능을 최적화한다.
   */
  async getProfileSummary(userId: number): Promise<ProfileSummaryResult> {
    const [user, followerCount, followingCount, solveStats] = await Promise.all([
      this.findUserOrThrow(userId, { currentTier: true }),
      this.followRepository.countBy({ followingId: userId }),
      this.followRepository.countBy({ followerId: userId }),
      this.calculateSolveStats(userId),
    ]);

    return {
      userId: user.id,
      displayName: user.displayName,
      profileImageUrl: user.profileImageUrl ?? null,
      experience: user.experience,
      currentStreak: user.currentStreak,
      tier: this.buildTierSummary(user.currentTier),
      followerCount,
      followingCount,
      ...solveStats,
    };
  }

  /**
   * 팔로워 목록을 조회한다.
   */
  async getFollowers(userId: number): Promise<ProfileFollowUser[]> {
    await this.findUserOrThrow(userId);

    const follows = await this.followRepository.find({
      where: { followingId: userId },
      relations: { follower: { currentTier: true } },
    });

    const followers = follows
      .filter(f => f.follower)
      .map(f => this.buildFollowUserSummary(f.follower));

    return this.sortFollowUsersByName(followers);
  }

  /**
   * 팔로잉 목록을 조회한다.
   */
  async getFollowing(userId: number): Promise<ProfileFollowUser[]> {
    await this.findUserOrThrow(userId);

    const follows = await this.followRepository.find({
      where: { followerId: userId },
      relations: { following: { currentTier: true } },
    });

    const followingUsers = follows
      .filter(f => f.following)
      .map(f => this.buildFollowUserSummary(f.following));

    return this.sortFollowUsersByName(followingUsers);
  }

  /**
   * 특정 사용자를 팔로우한다.
   */
  async followUser(targetUserId: number, followerUserId: number): Promise<FollowStateResult> {
    this.ensureNotSelfFollow(targetUserId, followerUserId);
    await this.findUserOrThrow(targetUserId);

    const existingFollow = await this.followRepository.findOneBy({
      followerId: followerUserId,
      followingId: targetUserId,
    });

    if (!existingFollow) {
      await this.followRepository.save(
        this.followRepository.create({ followerId: followerUserId, followingId: targetUserId }),
      );
    }

    return { isFollowing: true };
  }

  /**
   * 특정 사용자를 언팔로우한다.
   */
  async unfollowUser(targetUserId: number, followerUserId: number): Promise<FollowStateResult> {
    this.ensureNotSelfFollow(targetUserId, followerUserId);

    const existingFollow = await this.followRepository.findOneBy({
      followerId: followerUserId,
      followingId: targetUserId,
    });

    if (existingFollow) await this.followRepository.remove(existingFollow);

    return { isFollowing: false };
  }

  /**
   * 기간별 스트릭 데이터를 조회한다. (올해 1월 1일부터 현재까지)
   */
  async getStreaks(userId: number): Promise<ProfileStreakDay[]> {
    await this.findUserOrThrow(userId);

    const now = new Date();
    const startDate = toDateString(new Date(now.getFullYear(), 0, 1));
    const endDate = toDateString(now);

    const rawRows = await this.fetchSolvedCountsByDateRange(userId, startDate, endDate);

    return rawRows.map(row => ({
      userId,
      date: row.date,
      solvedCount: row.solvedCount,
    }));
  }

  /**
   * 최근 7일간의 학습 시간 통계를 조회한다.
   */
  async getDailyStats(userId: number): Promise<DailyStatsResult> {
    await this.findUserOrThrow(userId);

    const allDates = getLast7Days();
    const { startDate, endDate } = getDateRange(allDates);

    const studyTimeMap = await this.fetchStudySecondsByDateRange(userId, startDate, endDate);

    // 빈 날짜를 0으로 채움
    const dailyData = allDates.map(date => ({
      date,
      studySeconds: studyTimeMap.get(date) ?? 0,
    }));

    const studySecondsList = dailyData.map(d => d.studySeconds);
    const totalSeconds = studySecondsList.reduce((sum, s) => sum + s, 0);

    return {
      dailyData,
      periodMaxSeconds: Math.max(...studySecondsList, 0),
      periodAverageSeconds: dailyData.length > 0 ? Math.floor(totalSeconds / dailyData.length) : 0,
    };
  }

  /**
   * 최근 7일간 필드(로드맵)별 문제 풀이 통계를 조회한다.
   */
  async getFieldDailyStats(userId: number): Promise<FieldDailyStatsResult> {
    await this.findUserOrThrow(userId);

    const allDates = getLast7Days();
    const { startDate, endDate } = getDateRange(allDates);

    // 병렬 실행: 필드 목록 조회와 실제 풀이 로그 조회를 동시에 수행
    const [roadmapFields, rows] = await Promise.all([
      this.fetchAllFields(),
      this.fetchFieldSolvedCountsByDateRange(userId, startDate, endDate),
    ]);

    const fieldMap = this.initializeFieldStats(roadmapFields, allDates);
    this.applyFieldSolvedCounts(fieldMap, rows);

    return { fields: this.calculateFieldStatsSummary(fieldMap) };
  }

  // --- Private Helper Methods ---

  private ensureNotSelfFollow(targetUserId: number, followerUserId: number): void {
    if (targetUserId === followerUserId) {
      throw new BadRequestException('자기 자신은 팔로우할 수 없습니다.');
    }
  }

  private buildTierSummary(tier: User['currentTier']): ProfileTierSummary | null {
    return tier ? { id: tier.id, name: tier.name, orderIndex: tier.orderIndex } : null;
  }

  private buildFollowUserSummary(user: User): ProfileFollowUser {
    return {
      userId: user.id,
      displayName: user.displayName,
      profileImageUrl: user.profileImageUrl ?? null,
      experience: user.experience,
      tier: this.buildTierSummary(user.currentTier),
    };
  }

  /**
   * 이름 기준 정렬 (영어 > 한글 > 기타 순서)
   */
  private sortFollowUsersByName(users: ProfileFollowUser[]): ProfileFollowUser[] {
    return [...users].sort((left, right) => {
      const leftGroup = this.getDisplayNameGroup(left.displayName);
      const rightGroup = this.getDisplayNameGroup(right.displayName);

      if (leftGroup !== rightGroup) return leftGroup - rightGroup;

      if (leftGroup === 0)
        return ProfileService.COLLATOR_EN.compare(left.displayName, right.displayName);
      if (leftGroup === 1)
        return ProfileService.COLLATOR_KO.compare(left.displayName, right.displayName);
      return left.displayName.localeCompare(right.displayName);
    });
  }

  private getDisplayNameGroup(displayName: string): number {
    const firstChar = displayName.trim().charAt(0);
    if (!firstChar) return 2;
    if (/[A-Za-z]/.test(firstChar)) return 0;
    if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(firstChar)) return 1;
    return 2;
  }

  /**
   * 전체 누적 학습 시간 및 문제 풀이 수 계산
   */
  private async calculateSolveStats(userId: number): Promise<SolveStatsResult> {
    const [quizResult, durationResult] = await Promise.all([
      this.solveLogRepository
        .createQueryBuilder('solveLog')
        .select('COUNT(*)', 'solvedCount')
        .where('solveLog.userId = :userId AND solveLog.isCorrect = true', { userId })
        .getRawOne(),
      this.stepAttemptRepository
        .createQueryBuilder('stepAttempt')
        .select(
          'SUM(TIMESTAMPDIFF(SECOND, stepAttempt.startedAt, stepAttempt.finishedAt))',
          'totalSeconds',
        )
        .where('stepAttempt.userId = :userId AND stepAttempt.status = :status', {
          userId,
          status: StepAttemptStatus.COMPLETED,
        })
        .andWhere('stepAttempt.finishedAt IS NOT NULL')
        .getRawOne(),
    ]);

    const totalStudyTimeSeconds = Number(durationResult?.totalSeconds ?? 0);
    return {
      totalStudyTimeSeconds,
      totalStudyTimeMinutes: Math.floor(totalStudyTimeSeconds / 60),
      solvedQuizzesCount: Number(quizResult?.solvedCount ?? 0),
    };
  }

  /**
   * 날짜별 학습 시간(초) 조회
   */
  private async fetchStudySecondsByDateRange(
    userId: number,
    startDate: string,
    endDate: string,
  ): Promise<Map<string, number>> {
    const rows = await this.stepAttemptRepository
      .createQueryBuilder('stepAttempt')
      .select('DATE(stepAttempt.finishedAt)', 'date')
      .addSelect(
        'SUM(TIMESTAMPDIFF(SECOND, stepAttempt.startedAt, stepAttempt.finishedAt))',
        'seconds',
      )
      .where('stepAttempt.userId = :userId AND stepAttempt.status = :status', {
        userId,
        status: StepAttemptStatus.COMPLETED,
      })
      .andWhere('DATE(stepAttempt.finishedAt) BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(stepAttempt.finishedAt)')
      .getRawMany();

    return new Map(rows.map(r => [r.date, Number(r.seconds)]));
  }

  /**
   * 날짜별 문제 풀이 수 조회
   */
  private async fetchSolvedCountsByDateRange(userId: number, startDate: string, endDate: string) {
    const rows = await this.solveLogRepository
      .createQueryBuilder('solve')
      .select('DATE(solve.solvedAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('solve.userId = :userId')
      .andWhere('DATE(solve.solvedAt) BETWEEN :startDate AND :endDate', {
        userId,
        startDate,
        endDate,
      })
      .groupBy('DATE(solve.solvedAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return rows.map(r => ({ date: r.date, solvedCount: Number(r.count) }));
  }

  private async fetchAllFields() {
    return this.fieldRepository.find({ select: ['id', 'name', 'slug'], order: { id: 'ASC' } });
  }

  private initializeFieldStats(fields: any[], dates: string[]): Map<number, FieldDailyStatsItem> {
    const fieldMap = new Map();
    fields.forEach(f => {
      fieldMap.set(f.id, {
        fieldId: f.id,
        fieldName: f.name,
        fieldSlug: f.slug,
        dailyData: dates.map(date => ({ date, solvedCount: 0 })),
        periodMaxSolvedCount: 0,
        periodAverageSolvedCount: 0,
        totalSolvedCount: 0,
      });
    });
    return fieldMap;
  }

  /**
   * 필드별 풀이 수 쿼리
   */
  private async fetchFieldSolvedCountsByDateRange(
    userId: number,
    startDate: string,
    endDate: string,
  ) {
    return this.solveLogRepository
      .createQueryBuilder('solveLog')
      .innerJoin('solveLog.quiz', 'quiz')
      .innerJoin('quiz.step', 'step')
      .innerJoin('step.unit', 'unit')
      .innerJoin('unit.field', 'field')
      .select([
        'field.id AS fieldId',
        'field.name AS fieldName',
        'field.slug AS fieldSlug',
        'DATE(solveLog.solvedAt) AS date',
      ])
      .addSelect('COUNT(solveLog.id)', 'solvedCount')
      .where('solveLog.userId = :userId', { userId })
      .andWhere('DATE(solveLog.solvedAt) BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('field.id, date')
      .getRawMany();
  }

  private applyFieldSolvedCounts(fieldMap: Map<number, FieldDailyStatsItem>, rows: any[]): void {
    rows.forEach(row => {
      const fieldEntry = fieldMap.get(Number(row.fieldId));
      if (fieldEntry) {
        const dailyItem = fieldEntry.dailyData.find(d => d.date === row.date);
        if (dailyItem) dailyItem.solvedCount = Number(row.solvedCount);
      }
    });
  }

  /**
   * 필드별 통계 데이터의 최종 요약본(평균, 최대값)을 계산한다.
   */
  private calculateFieldStatsSummary(
    fieldMap: Map<number, FieldDailyStatsItem>,
  ): FieldDailyStatsItem[] {
    return Array.from(fieldMap.values()).map(entry => {
      const solvedCounts = entry.dailyData.map(d => d.solvedCount);
      const total = solvedCounts.reduce((a, b) => a + b, 0);
      return {
        ...entry,
        totalSolvedCount: total,
        periodMaxSolvedCount: Math.max(...solvedCounts, 0),
        periodAverageSolvedCount:
          entry.dailyData.length > 0 ? Math.floor(total / entry.dailyData.length) : 0,
      };
    });
  }
}
