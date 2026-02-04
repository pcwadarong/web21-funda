import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { QuizContentService } from '../common/utils/quiz-content.service';
import { QuizResultService } from '../common/utils/quiz-result.service';
import type { QuizResponse } from '../roadmap/dto/quiz-list.dto';
import type { MatchingPair, QuizSubmissionResponse } from '../roadmap/dto/quiz-submission.dto';
import { Quiz } from '../roadmap/entities/quiz.entity';
import { User } from '../users/entities/user.entity';

import { BattleStore } from './battle.store';
import { BattleRoomState } from './battle-state';

const ROOM_TTL_MS = 10 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 1000;

@Injectable()
export class BattleService implements OnModuleInit, OnModuleDestroy {
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly battleStore: BattleStore,
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly quizContentService: QuizContentService,
    private readonly quizResultService: QuizResultService,
  ) {}

  /**
   * 메모리 누수를 막기 위해 완료된 방을 주기적으로 정리한다.
   *
   * @returns 없음
   */
  onModuleInit(): void {
    this.startRoomCleanupScheduler();
  }

  /**
   * 모듈 종료 시 정리 타이머를 해제한다.
   *
   * @returns 없음
   */
  onModuleDestroy(): void {
    this.stopRoomCleanupScheduler();
  }

  /**
   * 방 상태를 조회한다.
   *
   * @param roomId 방 ID
   * @returns 방 상태
   */
  getRoom(roomId: string): BattleRoomState | null {
    return this.battleStore.getRoom(roomId);
  }

  /**
   * 방 상태를 저장한다.
   *
   * @param room 방 상태
   * @returns 없음
   */
  saveRoom(room: BattleRoomState): void {
    this.battleStore.setRoom(room);
  }

  /**
   * 방을 삭제한다.
   *
   * @param roomId 방 ID
   * @returns 없음
   */
  removeRoom(roomId: string): void {
    this.battleStore.deleteRoom(roomId);
  }

  /**
   * 모든 방 상태를 조회한다.
   *
   * @returns 방 상태 목록
   */
  getAllRooms(): BattleRoomState[] {
    return this.battleStore.getAllRooms();
  }

  /**
   * 방 정리 스케줄러를 시작한다.
   *
   * @returns 없음
   */
  private startRoomCleanupScheduler(): void {
    if (this.cleanupTimer) {
      return;
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredRooms();
    }, CLEANUP_INTERVAL_MS);
  }

  /**
   * 방 정리 스케줄러를 종료한다.
   *
   * @returns 없음
   */
  private stopRoomCleanupScheduler(): void {
    if (!this.cleanupTimer) {
      return;
    }

    clearInterval(this.cleanupTimer);
    this.cleanupTimer = null;
  }

  /**
   * finished/invalid 상태로 일정 시간이 지난 방을 정리한다.
   *
   * @returns 없음
   */
  private cleanupExpiredRooms(): void {
    const now = Date.now();
    const rooms = this.battleStore.getAllRooms();

    for (const room of rooms) {
      if (!this.shouldRemoveRoom(room, now)) {
        continue;
      }

      this.battleStore.deleteRoom(room.roomId);
    }
  }

  /**
   * TTL 기준으로 방을 삭제할지 판단한다.
   *
   * @param room 방 상태
   * @param now 현재 시각
   * @returns 삭제 여부
   */
  private shouldRemoveRoom(room: BattleRoomState, now: number): boolean {
    const isFinished = room.status === 'finished';
    const isInvalid = room.status === 'invalid';

    if (!isFinished && !isInvalid) {
      return false;
    }

    if (room.endedAt === null) {
      return false;
    }

    return now - room.endedAt >= ROOM_TTL_MS;
  }

  /**
   * 필드 슬러그 기준으로 배틀용 퀴즈 세트를 생성한다.
   *
   * @param fieldSlug 필드 슬러그
   * @param limit 퀴즈 개수
   * @returns 퀴즈 ID 목록
   */
  async createBattleQuizSet(fieldSlug: string, limit: number): Promise<number[]> {
    const quizRows = await this.quizRepository
      .createQueryBuilder('quiz')
      .select('quiz.id', 'id')
      .innerJoin('quiz.step', 'step')
      .innerJoin('step.unit', 'unit')
      .innerJoin('unit.field', 'field')
      .where('field.slug = :fieldSlug', { fieldSlug })
      .andWhere('(quiz.type IS NULL OR UPPER(quiz.type) != :matchingType)', {
        matchingType: 'MATCHING',
      })
      .getRawMany<{ id: number }>();

    const shuffled = this.shuffleArray(quizRows.map(quiz => quiz.id));
    return shuffled.slice(0, limit);
  }

  /**
   * 퀴즈 ID로 퀴즈 응답 데이터를 조회한다.
   *
   * @param quizId 퀴즈 ID
   * @returns 퀴즈 응답 데이터
   */
  async getBattleQuizById(quizId: number): Promise<QuizResponse | null> {
    const quiz = await this.quizRepository.findOne({ where: { id: quizId } });
    if (!quiz) {
      return null;
    }

    return this.quizContentService.toQuizResponse(quiz);
  }

  async getBattleQuizResultById(
    quizId: number,
    payload: {
      quiz_id: number;
      type: string;
      selection: { option_id?: string; pairs?: MatchingPair[] };
    },
  ): Promise<QuizSubmissionResponse | null> {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
      select: { id: true, type: true, answer: true, explanation: true },
      relations: { step: true },
    });

    if (!quiz) {
      return null;
    }

    const quizType = quiz.type?.toUpperCase();

    if (quizType === 'MATCHING') {
      const correctPairs = this.quizResultService.getMatchingAnswer(quiz.answer);
      const isCorrect = this.quizResultService.isCorrectMatching(
        payload.selection?.pairs,
        correctPairs,
      );

      const result: QuizSubmissionResponse = {
        quiz_id: quiz.id,
        is_correct: isCorrect,
        solution: {
          ...(correctPairs.length > 0 ? { correct_pairs: correctPairs } : {}),
          explanation: quiz.explanation ?? null,
        },
      };

      return result;
    }

    const correctOptionId = this.quizResultService.getOptionAnswer(quiz.answer);
    const isCorrect = this.quizResultService.isCorrectOption(
      payload.selection?.option_id,
      correctOptionId,
    );

    const result: QuizSubmissionResponse = {
      quiz_id: quiz.id,
      is_correct: isCorrect,
      solution: {
        ...(correctOptionId ? { correct_option_id: correctOptionId } : {}),
        explanation: quiz.explanation ?? null,
      },
    };

    return result;
  }

  /**
   * 우승 사용자에게 다이아 보상을 지급한다.
   *
   * @param userIds 보상 대상 사용자 ID 목록
   * @param amount 다이아 지급량
   * @returns 없음
   */
  async grantDiamondRewards(userIds: number[], amount: number): Promise<void> {
    if (userIds.length === 0) {
      return;
    }

    const users = await this.userRepository.find({
      where: { id: In(userIds) },
    });
    if (users.length === 0) {
      return;
    }

    for (const user of users) {
      user.diamondCount = user.diamondCount + amount;
    }

    await this.userRepository.save(users);
  }

  /**
   * 배열을 무작위로 섞는다.
   *
   * @param items 대상 배열
   * @returns 섞인 배열
   */
  private shuffleArray(items: number[]): number[] {
    const result = [...items];

    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const temp = result[index];
      const swapValue = result[swapIndex];

      if (temp === undefined || swapValue === undefined) {
        continue;
      }

      result[index] = swapValue;
      result[swapIndex] = temp;
    }

    return result;
  }
}
