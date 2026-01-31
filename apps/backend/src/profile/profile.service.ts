import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Like, Repository } from 'typeorm';

import { SolveLog } from '../progress/entities/solve-log.entity';
import { StepAttemptStatus, UserStepAttempt } from '../progress/entities/user-step-attempt.entity';
import { User } from '../users/entities/user.entity';

import type {
  FollowStateResult,
  ProfileFollowUser,
  ProfileSearchUser,
  ProfileSummaryResult,
  ProfileTierSummary,
} from './dto/profile.dto';
import type {
  ProfileCharacterApplyResult,
  ProfileCharacterListResult,
  ProfileCharacterPurchaseResult,
} from './dto/profile-character.dto';
import { ProfileCharacter } from './entities/profile-character.entity';
import { UserFollow } from './entities/user-follow.entity';
import { UserProfileCharacter } from './entities/user-profile-character.entity';

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
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SolveLog)
    private readonly solveLogRepository: Repository<SolveLog>,
    @InjectRepository(UserStepAttempt)
    private readonly stepAttemptRepository: Repository<UserStepAttempt>,
    @InjectRepository(UserFollow)
    private readonly followRepository: Repository<UserFollow>,
    @InjectRepository(ProfileCharacter)
    private readonly profileCharacterRepository: Repository<ProfileCharacter>,
    @InjectRepository(UserProfileCharacter)
    private readonly userProfileCharacterRepository: Repository<UserProfileCharacter>,
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
      relations: { currentTier: true, profileCharacter: true },
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
      profileImageUrl: user.profileCharacter?.imageUrl ?? user.profileImageUrl ?? null,
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
   * 프로필 캐릭터 목록을 반환한다.
   */
  async getProfileCharacters(userId: number): Promise<ProfileCharacterListResult> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
    }

    const ownedRows = await this.userProfileCharacterRepository.find({
      where: { userId },
      select: ['characterId'],
    });
    const ownedIds = ownedRows.map(row => row.characterId);
    const ownedSet = new Set(ownedIds);

    const whereClause =
      ownedIds.length > 0 ? [{ isActive: true }, { id: In(ownedIds) }] : [{ isActive: true }];

    const characters = await this.profileCharacterRepository.find({
      where: whereClause,
      order: { id: 'ASC' },
    });

    return {
      selectedCharacterId: user.profileCharacterId ?? null,
      diamondCount: user.diamondCount,
      characters: characters.map(character => ({
        id: character.id,
        imageUrl: character.imageUrl,
        priceDiamonds: character.priceDiamonds,
        description: character.description ?? null,
        isActive: character.isActive,
        isOwned: ownedSet.has(character.id),
      })),
    };
  }

  /**
   * 프로필 캐릭터를 구매한다.
   */
  async purchaseProfileCharacter(
    userId: number,
    characterId: number,
  ): Promise<ProfileCharacterPurchaseResult> {
    return this.dataSource.transaction(async manager => {
      const userRepository = manager.getRepository(User);
      const characterRepository = manager.getRepository(ProfileCharacter);
      const ownershipRepository = manager.getRepository(UserProfileCharacter);

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
      }

      const character = await characterRepository.findOne({ where: { id: characterId } });
      if (!character) {
        throw new NotFoundException('캐릭터 정보를 찾을 수 없습니다.');
      }

      if (!character.isActive) {
        throw new BadRequestException('판매 중인 캐릭터가 아닙니다.');
      }

      const existingOwnership = await ownershipRepository.findOne({
        where: { userId, characterId },
      });
      if (existingOwnership) {
        return {
          characterId,
          purchased: false,
          diamondCount: user.diamondCount,
        };
      }

      if (user.diamondCount < character.priceDiamonds) {
        throw new BadRequestException('다이아가 부족합니다.');
      }

      user.diamondCount -= character.priceDiamonds;
      await userRepository.save(user);

      const ownership = ownershipRepository.create({
        userId,
        characterId,
      });
      await ownershipRepository.save(ownership);

      return {
        characterId,
        purchased: true,
        diamondCount: user.diamondCount,
      };
    });
  }

  /**
   * 구매한 프로필 캐릭터를 적용한다.
   */
  async applyProfileCharacter(
    userId: number,
    characterId: number,
  ): Promise<ProfileCharacterApplyResult> {
    return this.dataSource.transaction(async manager => {
      const userRepository = manager.getRepository(User);
      const characterRepository = manager.getRepository(ProfileCharacter);
      const ownershipRepository = manager.getRepository(UserProfileCharacter);

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
      }

      const character = await characterRepository.findOne({ where: { id: characterId } });
      if (!character) {
        throw new NotFoundException('캐릭터 정보를 찾을 수 없습니다.');
      }

      const ownership = await ownershipRepository.findOne({
        where: { userId, characterId },
      });
      if (!ownership) {
        throw new BadRequestException('구매한 캐릭터만 적용할 수 있습니다.');
      }

      user.profileCharacterId = characterId;
      await userRepository.save(user);

      return {
        characterId,
        applied: true,
      };
    });
  }

  /**
   * 프로필 캐릭터 적용을 해제한다.
   */
  async clearProfileCharacter(userId: number): Promise<ProfileCharacterApplyResult> {
    return this.dataSource.transaction(async manager => {
      const userRepository = manager.getRepository(User);

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
      }

      user.profileCharacterId = null;
      await userRepository.save(user);

      return {
        characterId: 0,
        applied: false,
      };
    });
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
   * 사용자를 검색한다.
   *
   * @param {string} keyword 검색 키워드
   * @param {number} requesterUserId 검색을 요청한 사용자 ID
   * @returns {Promise<ProfileSearchUser[]>} 사용자 검색 결과
   */
  async searchUsers(keyword: string, requesterUserId: number): Promise<ProfileSearchUser[]> {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword.length < 1) {
      return [];
    }

    const searchKeyword = `%${trimmedKeyword}%`;

    const matchedUsers = await this.userRepository.find({
      where: [{ displayName: Like(searchKeyword) }, { email: Like(searchKeyword) }],
      relations: { currentTier: true, profileCharacter: true },
      take: 20,
    });

    const filteredUsers = matchedUsers.filter(user => user.id !== requesterUserId);
    const userIds = filteredUsers.map(user => user.id);

    const followRows =
      userIds.length > 0
        ? await this.followRepository.find({
            where: { followerId: requesterUserId, followingId: In(userIds) },
          })
        : [];

    const followingSet = new Set(followRows.map(row => row.followingId));

    const results: ProfileSearchUser[] = filteredUsers.map(user => ({
      userId: user.id,
      displayName: user.displayName,
      email: user.email ?? null,
      profileImageUrl: user.profileCharacter?.imageUrl ?? user.profileImageUrl ?? null,
      experience: user.experience,
      tier: this.buildTierSummary(user.currentTier ?? null),
      isFollowing: followingSet.has(user.id),
    }));

    return this.sortSearchUsersByName(results);
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
   * 검색 결과 사용자 목록을 이름 기준으로 정렬한다.
   *
   * @param {ProfileSearchUser[]} users 정렬할 사용자 목록
   * @returns {ProfileSearchUser[]} 정렬된 사용자 목록
   */
  private sortSearchUsersByName(users: ProfileSearchUser[]): ProfileSearchUser[] {
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
