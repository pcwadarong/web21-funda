import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QuizContentService } from '../common/utils/quiz-content.service';
import type { QuizResponse } from '../roadmap/dto/quiz-list.dto';
import { Quiz } from '../roadmap/entities/quiz.entity';

import { BattleStore } from './battle.store';
import { BattleRoomState } from './battle-state';

@Injectable()
export class BattleService {
  constructor(
    private readonly battleStore: BattleStore,
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    private readonly quizContentService: QuizContentService,
  ) {}

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
