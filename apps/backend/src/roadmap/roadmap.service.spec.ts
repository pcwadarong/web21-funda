import { NotFoundException } from '@nestjs/common';
import { type FindOneOptions, Repository } from 'typeorm';

import { Field, Quiz } from './entities';
import { RoadmapService } from './roadmap.service';

describe('RoadmapService', () => {
  let service: RoadmapService;
  let fieldRepository: Partial<Repository<Field>>;
  let quizRepository: Partial<Repository<Quiz>>;
  let findOneMock: jest.Mock<Promise<Field | null>, [FindOneOptions<Field>]>;
  let createQueryBuilderMock: jest.Mock;

  beforeEach(() => {
    findOneMock = jest.fn();
    createQueryBuilderMock = jest.fn();
    fieldRepository = {
      findOne: findOneMock,
    };
    quizRepository = {
      createQueryBuilder: createQueryBuilderMock,
    };

    service = new RoadmapService(
      fieldRepository as Repository<Field>,
      quizRepository as Repository<Quiz>,
    );
  });

  it('필드/유닛/스텝과 퀴즈 개수를 응답한다', async () => {
    const field = {
      name: '프론트엔드',
      slug: 'fe',
      units: [
        {
          id: 2,
          title: 'CSS 기초',
          orderIndex: 2,
          steps: [
            { id: 12, title: '레이아웃', orderIndex: 2, isCheckpoint: true },
            { id: 11, title: '선택자', orderIndex: 1, isCheckpoint: false },
          ],
        },
        {
          id: 1,
          title: 'HTML 기초',
          orderIndex: 1,
          steps: [{ id: 10, title: '태그', orderIndex: 1, isCheckpoint: false }],
        },
      ],
    } as Field;

    findOneMock.mockResolvedValue(field);

    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { stepId: 10, quizCount: '5' },
        { stepId: 11, quizCount: '4' },
        { stepId: 12, quizCount: '6' },
      ]),
    };
    createQueryBuilderMock.mockReturnValue(queryBuilder as never);

    const result = await service.getUnitsByFieldSlug('fe');

    expect(result.field).toEqual({ name: '프론트엔드', slug: 'fe' });
    expect(result.units.map(unit => unit.id)).toEqual([1, 2]);
    expect(result.units).toHaveLength(2);

    const unit1 = result.units[0];
    const unit2 = result.units[1];
    if (!unit1 || !unit2) {
      throw new Error('응답에 유닛이 있어야 합니다.');
    }

    expect(unit1.steps.map(step => step.id)).toEqual([10]);
    expect(unit2.steps.map(step => step.id)).toEqual([11, 12]);
    expect(unit1.steps[0]?.quizCount).toBe(5);
    expect(unit2.steps[0]?.quizCount).toBe(4);
    expect(unit2.steps[1]?.quizCount).toBe(6);
    expect(unit2.steps[1]?.isCheckpoint).toBe(true);
    expect(unit2.steps[1]?.isCompleted).toBe(false);
    expect(unit2.steps[1]?.isLocked).toBe(false);
  });

  it('필드를 찾지 못하면 예외를 던진다', async () => {
    findOneMock.mockResolvedValue(null);

    await expect(service.getUnitsByFieldSlug('fe')).rejects.toBeInstanceOf(NotFoundException);
  });
});
