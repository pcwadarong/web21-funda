import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';

import { RedisService } from '../common/redis/redis.service';
import { CodeFormatter } from '../common/utils/code-formatter';
import { getKstNow } from '../common/utils/kst-date';
import { QuizContentService } from '../common/utils/quiz-content.service';
import { QuizResultService } from '../common/utils/quiz-result.service';
import {
  QuizLearningStatus,
  SolveLog,
  StepAttemptStatus,
  UserQuizStatus,
  UserStepAttempt,
  UserStepStatus,
} from '../progress/entities';
import { RankingService } from '../ranking/ranking.service';
import { User } from '../users/entities/user.entity';

import type { FieldListResponse } from './dto/field-list.dto';
import type { FieldRoadmapResponse } from './dto/field-roadmap.dto';
import type { FieldUnitsResponse, StepSummary } from './dto/field-units.dto';
import type { FirstUnitResponse, UnitSummary } from './dto/first-unit.dto';
import type { QuizResponse } from './dto/quiz-list.dto';
import type { QuizSubmissionRequest, QuizSubmissionResponse } from './dto/quiz-submission.dto';
import type { UnitOverviewResponse } from './dto/unit-overview.dto';
import { CheckpointQuizPool, Field, Quiz, Step, Unit } from './entities';

const FIELD_LIST_CACHE_KEY = 'fields:list';
const FIELD_LIST_CACHE_TTL_SECONDS = 24 * 60 * 60;
const FIELD_UNITS_CACHE_TTL_SECONDS = 24 * 60 * 60;
const FIRST_UNIT_CACHE_TTL_SECONDS = 24 * 60 * 60;
const UNIT_OVERVIEW_CACHE_TTL_SECONDS = 24 * 60 * 60;
const UNIT_OVERVIEW_CACHE_KEY_PREFIX = 'unit:overview';

interface FieldUnitsBaseResponse {
  field: {
    name: string;
    slug: string;
  };
  units: Array<{
    id: number;
    title: string;
    orderIndex: number;
    steps: Array<{
      id: number;
      title: string;
      orderIndex: number;
      quizCount: number;
      isCheckpoint: boolean;
    }>;
  }>;
}

@Injectable()
export class RoadmapService {
  constructor(
    @InjectRepository(Field)
    private readonly fieldRepository: Repository<Field>,
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(Step)
    private readonly stepRepository: Repository<Step>,
    @InjectRepository(CheckpointQuizPool)
    private readonly checkpointQuizPoolRepository: Repository<CheckpointQuizPool>,
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    private readonly codeFormatter: CodeFormatter,
    @InjectRepository(SolveLog)
    private readonly solveLogRepository: Repository<SolveLog>,
    @InjectRepository(UserStepAttempt)
    private readonly stepAttemptRepository: Repository<UserStepAttempt>,
    private readonly quizContentService: QuizContentService,
    @InjectRepository(UserStepStatus)
    private readonly stepStatusRepository: Repository<UserStepStatus>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly rankingService: RankingService,
    private readonly redisService: RedisService,
    private readonly quizResultService: QuizResultService,
  ) {}

  /**
   * 분야 목록을 조회한다.
   * @returns 분야 리스트
   */
  async getFields(): Promise<FieldListResponse> {
    const cached = await this.getCachedFieldList();
    if (cached) {
      return cached;
    }

    const fields = await this.fieldRepository.find({
      select: ['slug', 'name', 'description'],
      order: { id: 'ASC' },
    });

    const response: FieldListResponse = {
      fields: fields.map(field => ({
        slug: field.slug,
        name: field.name,
        description: field.description ?? null,
        icon: this.getFieldIconBySlug(field.slug),
      })),
    };

    await this.setCachedFieldList(response);
    return response;
  }

  /**
   * 필드 슬러그 기준으로 유닛/스텝과 퀴즈 개수를 조회한다.
   * @param fieldSlug 필드 슬러그
   * @param userId 로그인 사용자 ID(없으면 null)
   * @returns 필드와 유닛/스텝 정보
   */
  async getUnitsByFieldSlug(fieldSlug: string, userId: number | null): Promise<FieldUnitsResponse> {
    let baseResponse = await this.getCachedFieldUnitsBase(fieldSlug);

    if (!baseResponse) {
      const field = await this.fieldRepository.findOne({
        where: { slug: fieldSlug },
        relations: { units: { steps: true } }, // 유닛과 스텝까지 함께 로딩
      });

      if (!field) {
        throw new NotFoundException('Field not found.'); // 존재하지 않으면 404
      }

      const units = field.units ?? [];
      const steps = units.flatMap(unit => unit.steps ?? []);
      const stepIds = steps.map(step => step.id);
      const uniqueStepIds = Array.from(new Set(stepIds));
      const quizCountByStepId = await this.getQuizCountByStepId(uniqueStepIds);

      baseResponse = this.buildFieldUnitsBaseResponse(field, units, quizCountByStepId);
      await this.setCachedFieldUnitsBase(fieldSlug, baseResponse);
    }

    const stepIds = this.extractStepIdsFromFieldUnitsBase(baseResponse);
    const completedStepIdSet = await this.getCompletedStepIdSet(stepIds, userId);

    return this.applyCompletedStepsToFieldUnitsBase(baseResponse, completedStepIdSet);
  }

  /**
   * 필드 슬러그 기준으로 로드맵(유닛 리스트)을 조회한다.
   * @param fieldSlug 필드 슬러그
   * @returns 필드와 유닛 목록
   */
  async getRoadmapByFieldSlug(
    fieldSlug: string,
    userId: number | null,
  ): Promise<FieldRoadmapResponse> {
    const field = await this.fieldRepository
      .createQueryBuilder('field')
      .leftJoinAndSelect('field.units', 'unit')
      .leftJoinAndSelect('unit.steps', 'step')
      .where('field.slug = :slug', { slug: fieldSlug })
      .orderBy('unit.orderIndex', 'ASC')
      .getOne();

    if (!field) {
      throw new NotFoundException('Field not found.');
    }

    const units = field.units ?? [];

    const calculatedUnits = await Promise.all(
      units.map(async unit => {
        const totalSteps = unit.steps?.length || 0;
        const userSteps = await this.getUserStepsByUnit(unit.id, userId);
        const completedSteps = userSteps.filter(step => step.isCompleted);
        const progress = Math.round((completedSteps.length / (totalSteps + 2)) * 100) || 0; // +2는 체크포인트 고려 (DB에 없어서 +2를 추가)
        const successRateArray = userSteps.map(step => step.successRate || 0);
        const successRate =
          successRateArray.length > 0
            ? Math.round(
                successRateArray.reduce((acc, cur) => acc + cur, 0) / successRateArray.length,
              )
            : 0;

        return {
          id: unit.id,
          title: unit.title,
          description: unit.description ?? '',
          orderIndex: unit.orderIndex,
          progress,
          successRate,
        };
      }),
    );

    return {
      field: {
        name: field.name,
        slug: field.slug,
      },
      units: calculatedUnits,
    };
  }

  private async getUserStepsByUnit(
    unitId: number,
    userId: number | null,
  ): Promise<UserStepStatus[]> {
    if (userId === null || userId === undefined) {
      return [];
    }

    const userSteps = await this.stepStatusRepository.find({
      where: { userId, step: { unit: { id: unitId } } },
      relations: { step: true },
    });

    return userSteps;
  }

  /**
   * 필드의 첫 번째 유닛을 조회한다.
   * @param fieldSlug 필드 슬러그
   * @returns 필드 정보와 첫 유닛
   */
  async getFirstUnitByFieldSlug(fieldSlug: string): Promise<FirstUnitResponse> {
    const cached = await this.getCachedFirstUnit(fieldSlug);
    if (cached) {
      return cached;
    }

    const field = await this.fieldRepository
      .createQueryBuilder('field')
      .leftJoinAndSelect('field.units', 'unit')
      .leftJoinAndSelect('unit.steps', 'step')
      .where('field.slug = :slug', { slug: fieldSlug })
      .orderBy('unit.orderIndex', 'ASC')
      .getOne();

    if (!field) {
      throw new NotFoundException('Field not found.');
    }

    const firstUnit = this.sortByOrderIndex(field.units ?? [])[0] ?? null;
    const steps = firstUnit?.steps ?? [];
    const quizCountByStepId = await this.getQuizCountByStepId(steps.map(step => step.id));

    let unitSummary: UnitSummary | null = null;
    if (firstUnit) {
      unitSummary = {
        id: firstUnit.id,
        title: firstUnit.title,
        orderIndex: firstUnit.orderIndex,
        steps: this.buildUnitStepsWithCheckpoints(steps, quizCountByStepId),
      };
    }

    const response: FirstUnitResponse = {
      field: {
        name: field.name,
        slug: field.slug,
      },
      unit: unitSummary,
    };

    await this.setCachedFirstUnit(fieldSlug, response);
    return response;
  }

  /**
   * 유닛 개요(overview)를 조회한다.
   * @param unitId 유닛 ID
   * @returns 유닛 개요 정보
   */
  async getUnitOverview(unitId: number): Promise<UnitOverviewResponse> {
    const cached = await this.getCachedUnitOverview(unitId);
    if (cached) {
      return cached;
    }

    const unit = await this.unitRepository.findOne({
      where: { id: unitId },
      select: { id: true, title: true, overview: true },
    });

    if (!unit) {
      throw new NotFoundException('Unit not found.');
    }

    const response: UnitOverviewResponse = {
      unit: {
        id: unit.id,
        title: unit.title,
        overview: unit.overview ?? null,
      },
    };

    await this.setCachedUnitOverview(unitId, response);
    return response;
  }

  /**
   * 유닛 개요(overview)를 수정한다.
   * @param unitId 유닛 ID
   * @param overview 유닛 개요(없으면 null)
   * @returns 유닛 개요 정보
   */
  async updateUnitOverview(unitId: number, overview: string | null): Promise<UnitOverviewResponse> {
    const unit = await this.unitRepository.findOne({
      where: { id: unitId },
      select: { id: true, title: true, overview: true },
    });

    if (!unit) {
      throw new NotFoundException('Unit not found.');
    }

    unit.overview = overview;

    const saved = await this.unitRepository.save(unit);

    const response: UnitOverviewResponse = {
      unit: {
        id: saved.id,
        title: saved.title,
        overview: saved.overview ?? null,
      },
    };

    await this.deleteCachedUnitOverview(unitId);
    return response;
  }

  /**
   * 스텝 ID 기준으로 퀴즈 목록을 조회한다.
   * @param stepId 스텝 ID
   * @returns 퀴즈 목록
   */
  async getQuizzesByStepId(stepId: number): Promise<QuizResponse[]> {
    const step = await this.stepRepository.findOne({
      where: { id: stepId },
      select: { id: true, isCheckpoint: true },
    });

    if (!step) {
      throw new NotFoundException('Step not found.'); // 스텝이 없으면 404
    }

    let quizzes: Quiz[] = [];

    if (step.isCheckpoint) {
      const pools = await this.checkpointQuizPoolRepository
        .createQueryBuilder('pool')
        .innerJoinAndSelect('pool.quiz', 'quiz')
        .where('pool.checkpoint_step_id = :stepId', { stepId })
        .getMany();

      const poolQuizzes = pools
        .map(pool => pool.quiz)
        .filter((quiz): quiz is Quiz => Boolean(quiz));

      quizzes = this.shuffleArray(poolQuizzes).slice(0, 10);
    } else {
      const stepQuizzes = await this.quizRepository
        .createQueryBuilder('quiz')
        .where('quiz.step_id = :stepId', { stepId })
        .getMany();

      quizzes = this.shuffleArray(stepQuizzes).slice(0, 10);
    }

    return Promise.all(quizzes.map(quiz => this.quizContentService.toQuizResponse(quiz)));
  }

  /**
   * Fisher-Yates 알고리즘을 사용하여 배열을 랜덤하게 섞는다.
   *
   * @param array 섞을 배열
   * @returns 섞인 배열 (원본 보존)
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled: T[] = [...array];

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i]!;
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp;
    }

    return shuffled;
  }

  /**
   * 퀴즈 정답 제출을 검증한다.
   * @param quizId 퀴즈 ID
   * @param payload 사용자가 제출한 답안
   * @param userId 사용자 ID
   * @param clientId 비로그인 사용자의 클라이언트 ID
   * @returns 채점 결과와 정답 정보
   */
  async submitQuiz(
    quizId: number,
    payload: QuizSubmissionRequest,
    userId: number | null,
    clientId?: string,
  ): Promise<QuizSubmissionResponse> {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
      select: { id: true, type: true, answer: true, explanation: true },
      relations: { step: true },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found.');
    }

    const quizType = quiz.type?.toUpperCase();
    const isDontKnow = this.isDontKnowSelection(payload);

    if (quizType === 'MATCHING') {
      const correctPairs = this.quizResultService.getMatchingAnswer(quiz.answer);
      const isCorrect = this.quizResultService.isCorrectMatching(
        payload.selection?.pairs,
        correctPairs,
      );

      // 오답이고 orderIndex가 4 또는 7인 경우 heart 차감
      let userHeartCount: number | undefined;
      if (
        !isCorrect &&
        (payload.current_step_order_index === 4 || payload.current_step_order_index === 7)
      ) {
        if (userId) {
          // 로그인 사용자: DB에 저장
          const user = await this.userRepository.findOne({ where: { id: userId } });
          if (user) {
            user.heartCount = Math.max(0, user.heartCount - 1);
            await this.userRepository.save(user);
            userHeartCount = user.heartCount;
          }
        } else if (clientId) {
          // 비로그인 사용자: Redis에 저장
          const currentHeart = await this.redisService.get(`heart:${clientId}`);
          const newHeart = Math.max(0, ((currentHeart as number) ?? 5) - 1);
          await this.redisService.set(`heart:${clientId}`, newHeart, 30 * 24 * 60 * 60);
        }
      }

      const result: QuizSubmissionResponse = {
        quiz_id: quiz.id,
        is_correct: isCorrect,
        solution: {
          ...(correctPairs.length > 0 ? { correct_pairs: correctPairs } : {}),
          explanation: quiz.explanation ?? null,
        },
        ...(userHeartCount !== undefined ? { user_heart_count: userHeartCount } : {}),
      };

      await this.saveSolveLog({
        userId,
        quiz,
        stepAttemptId: payload.step_attempt_id,
        isCorrect,
        isDontKnow,
      });

      return result;
    }

    const correctOptionId = this.quizResultService.getOptionAnswer(quiz.answer);
    const isCorrect = this.quizResultService.isCorrectOption(
      payload.selection?.option_id,
      correctOptionId,
    );

    // 오답이고 orderIndex가 4 또는 7인 경우 heart 차감
    let userHeartCount: number | undefined;
    if (
      !isCorrect &&
      (payload.current_step_order_index === 4 || payload.current_step_order_index === 7)
    ) {
      if (userId) {
        // 로그인 사용자: DB에 저장
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (user) {
          user.heartCount = Math.max(0, user.heartCount - 1);
          await this.userRepository.save(user);
          userHeartCount = user.heartCount;
        }
      } else if (clientId) {
        // 비로그인 사용자: Redis에 저장
        const currentHeart = await this.redisService.get(`heart:${clientId}`);
        const newHeart = Math.max(0, ((currentHeart as number) ?? 5) - 1);
        await this.redisService.set(`heart:${clientId}`, newHeart, 30 * 24 * 60 * 60);
      }
    }

    const result: QuizSubmissionResponse = {
      quiz_id: quiz.id,
      is_correct: isCorrect,
      solution: {
        ...(correctOptionId ? { correct_option_id: correctOptionId } : {}),
        explanation: quiz.explanation ?? null,
      },
      ...(userHeartCount !== undefined ? { user_heart_count: userHeartCount } : {}),
    };

    await this.saveSolveLog({
      userId,
      quiz,
      stepAttemptId: payload.step_attempt_id,
      isCorrect,
      isDontKnow,
    });

    return result;
  }

  /**
   * stepId별 퀴즈 개수를 조회해 Map으로 반환한다.
   * @param stepIds 스텝 ID 목록
   * @returns stepId -> quizCount 매핑
   */
  private async getQuizCountByStepId(stepIds: number[]): Promise<Map<number, number>> {
    if (stepIds.length === 0) {
      return new Map();
    }

    const quizCounts = await this.quizRepository
      .createQueryBuilder('quiz')
      .select('quiz.step_id', 'stepId')
      .addSelect('COUNT(quiz.id)', 'quizCount') // step별 퀴즈 개수
      .where('quiz.step_id IN (:...stepIds)', { stepIds })
      .groupBy('quiz.step_id') // step_id 기준 그룹화
      .getRawMany<{ stepId: number; quizCount: string }>(); // 엔티티가 아닌 raw row 반환

    return new Map(quizCounts.map(row => [Number(row.stepId), Number(row.quizCount)]));
  }

  /**
   * 필드 슬러그에 따른 아이콘 식별자를 반환한다.
   * @param slug 필드 슬러그
   * @returns 아이콘 식별자
   */
  private getFieldIconBySlug(slug: string): string {
    if (slug === 'fe') {
      return 'Frontend';
    }
    if (slug === 'be') {
      return 'Backend';
    }
    if (slug === 'mo') {
      return 'Mobile';
    }
    if (slug === 'cs') {
      return 'ComputerScience';
    }
    if (slug === 'algo') {
      return 'Algorithm';
    }
    if (slug === 'game') {
      return 'Game';
    }
    if (slug === 'da') {
      return 'Data';
    }
    if (slug === 'devops') {
      return 'Cloud';
    }

    return 'Unknown';
  }

  /**
   * 사용자 완료 스텝 ID를 Set으로 반환한다.
   * @param stepIds 스텝 ID 목록
   * @param userId 사용자 ID
   * @returns 완료 스텝 ID 집합
   */
  private async getCompletedStepIdSet(
    stepIds: number[],
    userId: number | null,
  ): Promise<Set<number>> {
    if (userId === null || userId === undefined || stepIds.length === 0) {
      return new Set();
    }

    const stepStatuses = await this.stepStatusRepository.find({
      where: { userId, isCompleted: true, step: { id: In(stepIds) } },
      relations: { step: true },
    });

    const completedStepIds = stepStatuses.map(status => status.step.id);
    return new Set(completedStepIds);
  }

  /**
   * 유닛의 스텝을 orderIndex 기준으로 정렬해 응답 형태로 변환한다.
   * 체크포인트 스텝은 DB에 저장된 값을 그대로 사용한다.
   */
  private buildUnitStepsWithCheckpoints(
    steps: Step[],
    quizCountByStepId: Map<number, number>,
    completedStepIdSet: Set<number> = new Set(),
  ): StepSummary[] {
    const sortedSteps = this.sortByOrderIndex(steps);
    return sortedSteps.map(step => {
      const isCompleted = completedStepIdSet.has(step.id);
      const isLocked = step.isCheckpoint && !isCompleted;

      return {
        id: step.id,
        title: step.title,
        orderIndex: step.orderIndex,
        quizCount: quizCountByStepId.get(step.id) ?? 0,
        isCheckpoint: step.isCheckpoint,
        isCompleted,
        isLocked,
      };
    });
  }

  /**
   * orderIndex 기준으로 오름차순 정렬한다.
   * @param items 정렬할 항목 목록
   * @returns 정렬된 항목 목록
   */
  private sortByOrderIndex<T extends { orderIndex: number }>(items: T[]): T[] {
    return [...items].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  private buildFieldUnitsBaseResponse(
    field: Field,
    units: NonNullable<Field['units']> = [],
    quizCountByStepId: Map<number, number>,
  ): FieldUnitsBaseResponse {
    return {
      field: {
        name: field.name,
        slug: field.slug,
      },
      units: this.sortByOrderIndex(units).map(unit => ({
        id: unit.id,
        title: unit.title,
        orderIndex: unit.orderIndex,
        steps: this.sortByOrderIndex(unit.steps ?? []).map(step => ({
          id: step.id,
          title: step.title,
          orderIndex: step.orderIndex,
          quizCount: quizCountByStepId.get(step.id) ?? 0,
          isCheckpoint: step.isCheckpoint,
        })),
      })),
    };
  }

  private applyCompletedStepsToFieldUnitsBase(
    base: FieldUnitsBaseResponse,
    completedStepIdSet: Set<number>,
  ): FieldUnitsResponse {
    return {
      field: base.field,
      units: base.units.map(unit => ({
        id: unit.id,
        title: unit.title,
        orderIndex: unit.orderIndex,
        steps: unit.steps.map(step => {
          const isCompleted = completedStepIdSet.has(step.id);
          const isLocked = step.isCheckpoint && !isCompleted;

          return {
            ...step,
            isCompleted,
            isLocked,
          };
        }),
      })),
    };
  }

  private extractStepIdsFromFieldUnitsBase(base: FieldUnitsBaseResponse): number[] {
    const stepIds: number[] = [];

    for (const unit of base.units) {
      for (const step of unit.steps) {
        stepIds.push(step.id);
      }
    }

    return Array.from(new Set(stepIds));
  }

  private buildFieldUnitsCacheKey(fieldSlug: string): string {
    return `fields:${fieldSlug}:units`;
  }

  private buildFirstUnitCacheKey(fieldSlug: string): string {
    return `fields:${fieldSlug}:first_unit`;
  }

  private async getCachedFieldList(): Promise<FieldListResponse | null> {
    try {
      const cached = await this.redisService.get(FIELD_LIST_CACHE_KEY);
      if (!this.isFieldListResponse(cached)) {
        return null;
      }
      return cached;
    } catch {
      return null;
    }
  }

  private async setCachedFieldList(value: FieldListResponse): Promise<void> {
    try {
      await this.redisService.set(FIELD_LIST_CACHE_KEY, value, FIELD_LIST_CACHE_TTL_SECONDS);
    } catch {
      return;
    }
  }

  private async getCachedFieldUnitsBase(fieldSlug: string): Promise<FieldUnitsBaseResponse | null> {
    const cacheKey = this.buildFieldUnitsCacheKey(fieldSlug);

    try {
      const cached = await this.redisService.get(cacheKey);
      if (!this.isFieldUnitsBaseResponse(cached)) {
        return null;
      }
      return cached;
    } catch {
      return null;
    }
  }

  private async setCachedFieldUnitsBase(
    fieldSlug: string,
    value: FieldUnitsBaseResponse,
  ): Promise<void> {
    const cacheKey = this.buildFieldUnitsCacheKey(fieldSlug);

    try {
      await this.redisService.set(cacheKey, value, FIELD_UNITS_CACHE_TTL_SECONDS);
    } catch {
      return;
    }
  }

  private async getCachedFirstUnit(fieldSlug: string): Promise<FirstUnitResponse | null> {
    const cacheKey = this.buildFirstUnitCacheKey(fieldSlug);

    try {
      const cached = await this.redisService.get(cacheKey);
      if (!this.isFirstUnitResponse(cached)) {
        return null;
      }
      return cached;
    } catch {
      return null;
    }
  }

  private async setCachedFirstUnit(fieldSlug: string, value: FirstUnitResponse): Promise<void> {
    const cacheKey = this.buildFirstUnitCacheKey(fieldSlug);

    try {
      await this.redisService.set(cacheKey, value, FIRST_UNIT_CACHE_TTL_SECONDS);
    } catch {
      return;
    }
  }

  private isFieldListResponse(value: unknown): value is FieldListResponse {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const record = value as { fields?: unknown };
    return Array.isArray(record.fields);
  }

  private isFieldUnitsBaseResponse(value: unknown): value is FieldUnitsBaseResponse {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const record = value as { field?: unknown; units?: unknown };
    if (!record.field || !record.units) {
      return false;
    }

    return Array.isArray(record.units);
  }

  private isFirstUnitResponse(value: unknown): value is FirstUnitResponse {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const record = value as { field?: unknown };
    return Boolean(record.field);
  }

  private buildUnitOverviewCacheKey(unitId: number): string {
    return `${UNIT_OVERVIEW_CACHE_KEY_PREFIX}:${unitId}`;
  }

  private async getCachedUnitOverview(unitId: number): Promise<UnitOverviewResponse | null> {
    const cacheKey = this.buildUnitOverviewCacheKey(unitId);

    try {
      const cached = await this.redisService.get(cacheKey);
      if (!this.isUnitOverviewResponse(cached)) {
        return null;
      }
      return cached;
    } catch {
      return null;
    }
  }

  private async setCachedUnitOverview(unitId: number, value: UnitOverviewResponse): Promise<void> {
    const cacheKey = this.buildUnitOverviewCacheKey(unitId);

    try {
      await this.redisService.set(cacheKey, value, UNIT_OVERVIEW_CACHE_TTL_SECONDS);
    } catch {
      return;
    }
  }

  private async deleteCachedUnitOverview(unitId: number): Promise<void> {
    const cacheKey = this.buildUnitOverviewCacheKey(unitId);

    try {
      await this.redisService.del(cacheKey);
    } catch {
      return;
    }
  }

  private isUnitOverviewResponse(value: unknown): value is UnitOverviewResponse {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const record = value as { unit?: unknown };
    if (!record.unit || typeof record.unit !== 'object') {
      return false;
    }

    const unitRecord = record.unit as { id?: unknown; title?: unknown };
    return typeof unitRecord.id === 'number' && typeof unitRecord.title === 'string';
  }

  private async saveSolveLog(params: {
    userId: number | null;
    quiz: Quiz;
    stepAttemptId?: number;
    isCorrect: boolean;
    isDontKnow: boolean;
  }): Promise<void> {
    const { userId, quiz, stepAttemptId, isCorrect, isDontKnow } = params;

    if (userId === null || userId === undefined) {
      return;
    }

    // 복습 기준과 일치시키기 위해 KST 기준 시각으로 저장한다.
    const solvedAt = getKstNow();
    const qualityScore = this.calculateQualityScore(isCorrect);

    await this.dataSource.transaction(async manager => {
      // 풀이 기록과 SRS 상태를 항상 같이 반영하기 위해 트랜잭션으로 묶는다.
      const stepAttempt = await this.findStepAttemptForSolveLog({
        manager,
        userId,
        quiz,
        stepAttemptId,
      });

      const solveLogRepository = manager.getRepository(SolveLog);
      const stepAttemptValue = stepAttempt ? stepAttempt : null;
      const log = solveLogRepository.create({
        userId,
        quiz,
        stepAttempt: stepAttemptValue,
        isCorrect,
        quality: qualityScore,
        solvedAt,
        duration: null,
      });

      await solveLogRepository.save(log);
      await this.updateUserQuizStatusWithSm2({
        manager,
        userId,
        quiz,
        qualityScore,
        solvedAt,
        isDontKnow,
      });
      await this.rankingService.assignUserToGroupOnFirstSolveWithManager(manager, {
        userId,
        solvedAt,
      });
      await this.rankingService.addWeeklyXpOnSolveWithManager(manager, {
        userId,
        solvedAt,
        isCorrect,
      });
    });
  }

  /**
   * 풀이 로그가 속할 스텝 시도를 찾는다.
   *
   * @param params.manager 트랜잭션 매니저
   * @param params.userId 사용자 ID
   * @param params.quiz 대상 퀴즈
   * @param params.stepAttemptId 요청에서 전달된 시도 ID
   * @returns 스텝 시도 엔티티 또는 null
   */
  private async findStepAttemptForSolveLog(params: {
    manager: EntityManager;
    userId: number;
    quiz: Quiz;
    stepAttemptId?: number;
  }): Promise<UserStepAttempt | null> {
    const { manager, userId, quiz, stepAttemptId } = params;
    const stepAttemptRepository = manager.getRepository(UserStepAttempt);

    if (stepAttemptId) {
      return stepAttemptRepository.findOne({
        where: { id: stepAttemptId, userId },
      });
    }

    if (!quiz.step || !quiz.step.id) {
      return null;
    }

    return stepAttemptRepository.findOne({
      where: { userId, step: { id: quiz.step.id }, status: StepAttemptStatus.IN_PROGRESS },
      order: { startedAt: 'DESC' },
    });
  }

  /**
   * SM-2 규칙에 따라 유저 퀴즈 상태를 갱신한다.
   *
   * @param params.manager 트랜잭션 매니저
   * @param params.userId 사용자 ID
   * @param params.quiz 대상 퀴즈
   * @param params.qualityScore 풀이 품질 점수
   * @param params.solvedAt 풀이 시각
   */
  private async updateUserQuizStatusWithSm2(params: {
    manager: EntityManager;
    userId: number;
    quiz: Quiz;
    qualityScore: number;
    solvedAt: Date;
    isDontKnow: boolean;
  }): Promise<void> {
    const { manager, userId, quiz, qualityScore, solvedAt, isDontKnow } = params;
    const userQuizStatusRepository = manager.getRepository(UserQuizStatus);

    const existingStatus = await userQuizStatusRepository.findOne({
      where: { userId, quiz: { id: quiz.id } },
    });

    let baseStatus: UserQuizStatus;
    if (existingStatus) {
      baseStatus = existingStatus;
    } else {
      baseStatus = userQuizStatusRepository.create({
        userId,
        quiz,
        status: QuizLearningStatus.LEARNING,
        interval: 0,
        easeFactor: 2.5,
        repetition: 0,
        lastQuality: null,
        reviewCount: 0,
        lapseCount: 0,
        nextReviewAt: null,
        lastSolvedAt: null,
        isWrong: false,
        isDontKnow: false,
      });
    }

    let baseEaseFactor = baseStatus.easeFactor;
    if (baseEaseFactor === null || baseEaseFactor === undefined) {
      baseEaseFactor = 2.5;
    }
    const nextEaseFactor = this.calculateEaseFactor(baseEaseFactor, qualityScore);
    const isSuccess = qualityScore >= 3;
    let baseRepetition = baseStatus.repetition;
    if (baseRepetition === null || baseRepetition === undefined) {
      baseRepetition = 0;
    }
    let baseInterval = baseStatus.interval;
    if (baseInterval === null || baseInterval === undefined) {
      baseInterval = 0;
    }
    let baseReviewCount = baseStatus.reviewCount;
    if (baseReviewCount === null || baseReviewCount === undefined) {
      baseReviewCount = 0;
    }
    let baseLapseCount = baseStatus.lapseCount;
    if (baseLapseCount === null || baseLapseCount === undefined) {
      baseLapseCount = 0;
    }

    let nextRepetition = 0;
    let nextInterval = 1;
    let nextStatus = QuizLearningStatus.LEARNING;
    let nextIsWrong = true;
    let nextLapseCount = baseLapseCount;
    let nextIsDontKnow = false;

    if (isSuccess) {
      nextRepetition = baseRepetition + 1;
      nextInterval = this.calculateInterval(nextRepetition, baseInterval, nextEaseFactor);
      nextStatus = QuizLearningStatus.REVIEW;
      nextIsWrong = false;
      nextIsDontKnow = false;
    } else {
      nextRepetition = 0;
      nextInterval = isDontKnow ? 0 : 1;
      nextStatus = QuizLearningStatus.LEARNING;
      nextIsWrong = true;
      nextLapseCount = baseLapseCount + 1;
      nextIsDontKnow = isDontKnow;
    }

    if (isSuccess && nextInterval >= 30) {
      nextStatus = QuizLearningStatus.MASTERED;
    }

    baseStatus.easeFactor = nextEaseFactor;
    baseStatus.repetition = nextRepetition;
    baseStatus.interval = nextInterval;
    baseStatus.status = nextStatus;
    baseStatus.isWrong = nextIsWrong;
    baseStatus.isDontKnow = nextIsDontKnow;
    baseStatus.lastQuality = qualityScore;
    baseStatus.reviewCount = baseReviewCount + 1;
    baseStatus.lapseCount = nextLapseCount;
    baseStatus.lastSolvedAt = solvedAt;
    baseStatus.nextReviewAt = this.calculateNextReviewAt(solvedAt, nextInterval);

    await userQuizStatusRepository.save(baseStatus);
  }

  /**
   * 정답 여부로 기본 품질 점수를 계산한다.
   *
   * @param isCorrect 정답 여부
   * @returns SM-2 품질 점수
   */
  private calculateQualityScore(isCorrect: boolean): number {
    if (isCorrect) {
      return 5;
    }
    return 2;
  }

  /**
   * "잘 모르겠어요" 제출 여부를 판별한다.
   * - selection에 option_id와 pairs가 모두 없는 경우로 판단한다.
   *
   * @param payload 제출 요청 데이터
   * @returns 잘 모르겠어요 여부
   */
  private isDontKnowSelection(payload: QuizSubmissionRequest): boolean {
    if (payload.is_dont_know === true) {
      return true;
    }

    if (!payload.selection) {
      return true;
    }

    const hasOption =
      typeof payload.selection.option_id === 'string' &&
      payload.selection.option_id.trim().length > 0;
    const hasPairs = Array.isArray(payload.selection.pairs) && payload.selection.pairs.length > 0;

    return !hasOption && !hasPairs;
  }

  /**
   * SM-2 공식을 적용해 난이도 계수를 갱신한다.
   *
   * @param currentEaseFactor 현재 난이도 계수
   * @param qualityScore 품질 점수
   * @returns 갱신된 난이도 계수
   */
  private calculateEaseFactor(currentEaseFactor: number, qualityScore: number): number {
    const scoreGap = 5 - qualityScore;
    const delta = 0.1 - scoreGap * (0.08 + scoreGap * 0.02);
    const nextEaseFactor = currentEaseFactor + delta;

    return Math.max(nextEaseFactor, 1.3);
  }

  /**
   * SM-2 규칙으로 다음 복습 간격을 계산한다.
   *
   * @param repetition 업데이트된 연속 정답 횟수
   * @param previousInterval 기존 복습 간격(일)
   * @param easeFactor 갱신된 난이도 계수
   * @returns 다음 복습 간격(일)
   */
  private calculateInterval(
    repetition: number,
    previousInterval: number,
    easeFactor: number,
  ): number {
    if (repetition === 1) {
      return 1;
    }
    if (repetition === 2) {
      return 6;
    }
    return Math.round(previousInterval * easeFactor);
  }

  /**
   * 복습 간격을 기준으로 다음 복습 일시를 계산한다.
   *
   * @param solvedAt 풀이 시각
   * @param intervalDays 복습 간격(일)
   * @returns 다음 복습 일시
   */
  private calculateNextReviewAt(solvedAt: Date, intervalDays: number): Date {
    const dayMilliseconds = 24 * 60 * 60 * 1000;
    const totalOffset = intervalDays * dayMilliseconds;
    return new Date(solvedAt.getTime() + totalOffset);
  }
}
