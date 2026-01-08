import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { FieldUnitsResponse } from './dto/field-units.dto';
import { Field, Quiz } from './entities';

@Injectable()
export class RoadmapService {
  constructor(
    @InjectRepository(Field)
    private readonly fieldRepository: Repository<Field>,
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
  ) {}

  /**
   * 필드 슬러그 기준으로 유닛/스텝과 퀴즈 개수를 조회한다.
   * @param fieldSlug 필드 슬러그
   * @returns 필드와 유닛/스텝 정보
   */
  async getUnitsByFieldSlug(fieldSlug: string): Promise<FieldUnitsResponse> {
    const field = await this.fieldRepository.findOne({
      where: { slug: fieldSlug },
      relations: { units: { steps: true } }, // 유닛과 스텝까지 함께 로딩
    });

    if (!field) {
      throw new NotFoundException('Field not found.'); // 존재하지 않으면 404
    }

    const units = field.units ?? [];
    const steps = units.flatMap(unit => unit.steps ?? []);
    const quizCountByStepId = await this.getQuizCountByStepId(steps.map(step => step.id));

    return this.buildFieldUnitsResponse(field, units, quizCountByStepId);
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
   * 엔티티를 응답 DTO 형태로 변환한다.
   * @param field 필드 엔티티
   * @param units 유닛 엔티티 목록
   * @param quizCountByStepId stepId -> quizCount 매핑
   * @returns 응답 DTO
   */
  private buildFieldUnitsResponse(
    field: Field,
    units: NonNullable<Field['units']> = [],
    quizCountByStepId: Map<number, number>,
  ): FieldUnitsResponse {
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
          isCompleted: false,
          isLocked: false,
        })),
      })),
    };
  }

  /**
   * orderIndex 기준으로 오름차순 정렬한다.
   * @param items 정렬할 항목 목록
   * @returns 정렬된 항목 목록
   */
  private sortByOrderIndex<T extends { orderIndex: number }>(items: T[]): T[] {
    return [...items].sort((a, b) => a.orderIndex - b.orderIndex);
  }
}
