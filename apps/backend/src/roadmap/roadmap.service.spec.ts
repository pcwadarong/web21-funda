import { NotFoundException } from '@nestjs/common';
import { type FindOneOptions, Repository } from 'typeorm';

import { Field, Quiz, Step } from './entities';
import { RoadmapService } from './roadmap.service';

describe('RoadmapService', () => {
  let service: RoadmapService;
  let fieldRepository: Partial<Repository<Field>>;
  let quizRepository: Partial<Repository<Quiz>>;
  let stepRepository: Partial<Repository<Step>>;
  let findFieldMock: jest.Mock<Promise<Field | null>, [FindOneOptions<Field>]>;
  let findStepMock: jest.Mock<Promise<Step | null>, [FindOneOptions<Step>]>;
  let createQueryBuilderMock: jest.Mock;
  let quizFindMock: jest.Mock;

  beforeEach(() => {
    findFieldMock = jest.fn();
    findStepMock = jest.fn();
    createQueryBuilderMock = jest.fn();
    quizFindMock = jest.fn();
    fieldRepository = {
      findOne: findFieldMock,
    };
    quizRepository = {
      createQueryBuilder: createQueryBuilderMock,
      find: quizFindMock,
    };
    stepRepository = {
      findOne: findStepMock,
    };

    service = new RoadmapService(
      fieldRepository as Repository<Field>,
      quizRepository as Repository<Quiz>,
      stepRepository as Repository<Step>,
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

    findFieldMock.mockResolvedValue(field);

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
    findFieldMock.mockResolvedValue(null);

    await expect(service.getUnitsByFieldSlug('fe')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('스텝별 퀴즈 목록을 응답한다', async () => {
    findStepMock.mockResolvedValue({ id: 1 } as Step);
    quizFindMock.mockResolvedValue([
      {
        id: 1,
        type: 'MCQ',
        question: '페이지의 주요 콘텐츠 영역을 나타내는 시멘틱 요소는?',
        content: {
          question: '페이지의 주요 콘텐츠 영역을 나타내는 시멘틱 요소는?',
          options: [
            { id: 'c1', text: '<main>' },
            { id: 'c2', text: '<footer>' },
            { id: 'c3', text: '<aside>' },
          ],
        },
      },
      {
        id: 2,
        type: 'MATCHING',
        question: '시멘틱 태그 매칭',
        content: {
          left: ['<header>', '<nav>', '<article>', '<aside>'],
          right: [
            '문서/섹션의 머리말(제목, 소개 등)',
            '내비게이션 링크 모음',
            '독립적으로 배포/재사용 가능한 콘텐츠 단위',
            '보조 콘텐츠(사이드바, 관련 링크 등)',
          ],
        },
      },
      {
        id: 3,
        type: 'CODE',
        question: '네비게이션 영역을 의미하는 시멘틱 요소는?',
        content: JSON.stringify({
          code: '<{{BLANK}}>\n  <a href="/">Home</a>\n  <a href="/about">About</a>\n</{{BLANK}}>',
          options: [
            { id: 'c1', text: 'div' },
            { id: 'c2', text: 'nav' },
            { id: 'c3', text: 'section' },
            { id: 'c4', text: 'article' },
            { id: 'c5', text: 'span' },
          ],
          language: 'html',
        }),
      },
    ] as Quiz[]);

    const result = await service.getQuizzesByStepId(1);

    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({
      id: 1,
      type: 'MCQ',
      content: {
        question: '페이지의 주요 콘텐츠 영역을 나타내는 시멘틱 요소는?',
        options: [
          { id: 'c1', text: '<main>' },
          { id: 'c2', text: '<footer>' },
          { id: 'c3', text: '<aside>' },
        ],
      },
    });
    expect(result[1]).toMatchObject({
      id: 2,
      type: 'MATCHING',
      content: {
        question: '시멘틱 태그 매칭',
        matching_metadata: {
          left: ['<header>', '<nav>', '<article>', '<aside>'],
          right: [
            '문서/섹션의 머리말(제목, 소개 등)',
            '내비게이션 링크 모음',
            '독립적으로 배포/재사용 가능한 콘텐츠 단위',
            '보조 콘텐츠(사이드바, 관련 링크 등)',
          ],
        },
      },
    });
    expect(result[2]).toMatchObject({
      id: 3,
      type: 'CODE',
      content: {
        question: '네비게이션 영역을 의미하는 시멘틱 요소는?',
        options: [
          { id: 'c1', text: 'div' },
          { id: 'c2', text: 'nav' },
          { id: 'c3', text: 'section' },
          { id: 'c4', text: 'article' },
          { id: 'c5', text: 'span' },
        ],
        code_metadata: {
          language: 'html',
          snippet:
            '<{{BLANK}}>\n  <a href="/">Home</a>\n  <a href="/about">About</a>\n</{{BLANK}}>',
        },
      },
    });
  });

  it('스텝을 찾지 못하면 예외를 던진다', async () => {
    findStepMock.mockResolvedValue(null);

    await expect(service.getQuizzesByStepId(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
