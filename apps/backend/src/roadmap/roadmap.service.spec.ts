import { NotFoundException } from '@nestjs/common';
import { type FindOneOptions, Repository } from 'typeorm';

import { CodeFormatter } from '../common/utils/code-formatter';
import { SolveLog, UserStepAttempt, UserStepStatus } from '../progress/entities';

import { Field, Quiz, Step } from './entities';
import { RoadmapService } from './roadmap.service';

jest.mock('../common/utils/code-formatter');

describe('RoadmapService', () => {
  let service: RoadmapService;
  let fieldRepository: Partial<Repository<Field>>;
  let quizRepository: Partial<Repository<Quiz>>;
  let stepRepository: Partial<Repository<Step>>;
  let solveLogRepository: Partial<Repository<SolveLog>>;
  let stepAttemptRepository: Partial<Repository<UserStepAttempt>>;
  let stepStatusRepository: Partial<Repository<UserStepStatus>>;
  let codeFormatter: Partial<CodeFormatter>;
  let roadmapQueryBuilderMock: {
    leftJoinAndSelect: jest.Mock;
    where: jest.Mock;
    orderBy: jest.Mock;
    getOne: jest.Mock;
  };
  let findFieldsMock: jest.Mock<Promise<Field[]>>;
  let findFieldMock: jest.Mock<Promise<Field | null>, [FindOneOptions<Field>]>;
  let findStepMock: jest.Mock<Promise<Step | null>, [FindOneOptions<Step>]>;
  let findQuizMock: jest.Mock<Promise<Quiz | null>, [FindOneOptions<Quiz>]>;
  let createQueryBuilderMock: jest.Mock;
  let quizFindMock: jest.Mock;
  let formatMock: jest.Mock;
  let stepStatusFindMock: jest.Mock;

  beforeEach(() => {
    findFieldsMock = jest.fn();
    findFieldMock = jest.fn();
    findStepMock = jest.fn();
    findQuizMock = jest.fn();
    createQueryBuilderMock = jest.fn();
    quizFindMock = jest.fn();
    formatMock = jest.fn().mockImplementation((code: string) => Promise.resolve(code));
    stepStatusFindMock = jest.fn();
    roadmapQueryBuilderMock = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };
    fieldRepository = {
      find: findFieldsMock,
      findOne: findFieldMock,
      createQueryBuilder: jest.fn().mockReturnValue(roadmapQueryBuilderMock),
    };
    quizRepository = {
      createQueryBuilder: createQueryBuilderMock,
      find: quizFindMock,
      findOne: findQuizMock,
    };
    stepRepository = {
      findOne: findStepMock,
    };
    solveLogRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    stepAttemptRepository = {
      findOne: jest.fn(),
    };
    stepStatusRepository = {
      find: stepStatusFindMock,
    };
    codeFormatter = {
      format: formatMock,
    };

    service = new RoadmapService(
      fieldRepository as Repository<Field>,
      quizRepository as Repository<Quiz>,
      stepRepository as Repository<Step>,
      codeFormatter as CodeFormatter,
      solveLogRepository as Repository<SolveLog>,
      stepAttemptRepository as Repository<UserStepAttempt>,
      stepStatusRepository as Repository<UserStepStatus>,
    );
  });

  it('분야 리스트를 응답한다', async () => {
    findFieldsMock.mockResolvedValue([
      { slug: 'fe', name: 'Frontend', description: '프론트엔드' } as Field,
      { slug: 'be', name: 'Backend', description: null } as Field,
    ]);

    const result = await service.getFields();

    expect(result).toEqual({
      fields: [
        { slug: 'fe', name: 'Frontend', description: '프론트엔드', icon: 'Frontend' },
        { slug: 'be', name: 'Backend', description: null, icon: 'Backend' },
      ],
    });
  });

  it('필드 로드맵(유닛 리스트)을 응답한다', async () => {
    roadmapQueryBuilderMock.getOne.mockResolvedValue({
      name: 'Frontend',
      slug: 'fe',
      units: [
        { id: 2, title: 'JS', orderIndex: 2, steps: [{ id: 3 }, { id: 4 }] },
        { id: 1, title: 'HTML', orderIndex: 1, steps: [{ id: 1 }, { id: 2 }] },
      ],
    } as Field);

    const result = await service.getRoadmapByFieldSlug('fe', null);

    expect(result).toEqual({
      field: { name: 'Frontend', slug: 'fe' },
      units: [
        { id: 2, title: 'JS', orderIndex: 2, progress: 0, successRate: 0 },
        { id: 1, title: 'HTML', orderIndex: 1, progress: 0, successRate: 0 },
      ],
    });
    expect(roadmapQueryBuilderMock.orderBy).toHaveBeenCalledWith('unit.orderIndex', 'ASC');
  });

  it('필드 첫 번째 유닛을 응답한다', async () => {
    roadmapQueryBuilderMock.getOne.mockResolvedValue({
      name: 'Frontend',
      slug: 'fe',
      units: [
        {
          id: 1,
          title: 'HTML',
          orderIndex: 1,
          steps: [
            { id: 10, title: '태그', orderIndex: 1, isCheckpoint: false },
            { id: 11, title: '속성', orderIndex: 2, isCheckpoint: false },
          ],
        },
        { id: 2, title: 'CSS', orderIndex: 2 },
      ],
    } as Field);

    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { stepId: 10, quizCount: '5' },
        { stepId: 11, quizCount: '4' },
      ]),
    };
    createQueryBuilderMock.mockReturnValue(queryBuilder as never);

    const result = await service.getFirstUnitByFieldSlug('fe');

    expect(result).toEqual({
      field: { name: 'Frontend', slug: 'fe' },
      unit: {
        id: 1,
        title: 'HTML',
        orderIndex: 1,
        steps: expect.any(Array),
      },
    });
    expect(result.unit?.steps).toHaveLength(2);
    expect(result.unit?.steps.filter(step => step.isCheckpoint).length).toBe(0);
    expect(result.unit?.steps.find(step => step.id === 10)?.quizCount).toBe(5);
    expect(result.unit?.steps.find(step => step.id === 11)?.quizCount).toBe(4);
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

    const result = await service.getUnitsByFieldSlug('fe', null);

    expect(result.field).toEqual({ name: '프론트엔드', slug: 'fe' });
    expect(result.units.map(unit => unit.id)).toEqual([1, 2]);

    const unit1 = result.units[0];
    const unit2 = result.units[1];
    if (!unit1 || !unit2) {
      throw new Error('응답에 유닛이 있어야 합니다.');
    }

    expect(unit1.steps).toHaveLength(1);
    expect(unit1.steps.filter(step => step.id === 10).length).toBe(1);
    expect(unit1.steps.filter(step => step.isCheckpoint).length).toBe(0);
    expect(unit1.steps.find(step => step.id === 10)?.quizCount).toBe(5);

    expect(unit2.steps).toHaveLength(2);
    expect(unit2.steps.filter(step => step.id === 11 || step.id === 12).length).toBe(2);
    expect(unit2.steps.filter(step => step.isCheckpoint).length).toBe(1);
    expect(unit2.steps.find(step => step.id === 11)?.quizCount).toBe(4);
    expect(unit2.steps.find(step => step.id === 12)?.quizCount).toBe(6);
  });

  it('로그인 사용자 완료 스텝 상태를 반영한다', async () => {
    const field = {
      name: '프론트엔드',
      slug: 'fe',
      units: [
        {
          id: 1,
          title: 'HTML 기초',
          orderIndex: 1,
          steps: [
            { id: 10, title: '태그', orderIndex: 1, isCheckpoint: false },
            { id: 11, title: '속성', orderIndex: 2, isCheckpoint: false },
          ],
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
        { stepId: 10, quizCount: '1' },
        { stepId: 11, quizCount: '1' },
      ]),
    };
    createQueryBuilderMock.mockReturnValue(queryBuilder as never);

    stepStatusFindMock.mockResolvedValue([{ step: { id: 10 } } as UserStepStatus]);

    const result = await service.getUnitsByFieldSlug('fe', 42);
    const steps = result.units[0]?.steps ?? [];

    expect(steps.find(step => step.id === 10)?.isCompleted).toBe(true);
    expect(steps.find(step => step.id === 11)?.isCompleted).toBe(false);
  });

  it('필드를 찾지 못하면 예외를 던진다', async () => {
    findFieldMock.mockResolvedValue(null);

    await expect(service.getUnitsByFieldSlug('fe', null)).rejects.toBeInstanceOf(NotFoundException);
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
          left: [
            { id: '<header>', text: '<header>' },
            { id: '<nav>', text: '<nav>' },
            { id: '<article>', text: '<article>' },
            { id: '<aside>', text: '<aside>' },
          ],
          right: [
            { id: '문서/섹션의 머리말(제목, 소개 등)', text: '문서/섹션의 머리말(제목, 소개 등)' },
            { id: '내비게이션 링크 모음', text: '내비게이션 링크 모음' },
            {
              id: '독립적으로 배포/재사용 가능한 콘텐츠 단위',
              text: '독립적으로 배포/재사용 가능한 콘텐츠 단위',
            },
            {
              id: '보조 콘텐츠(사이드바, 관련 링크 등)',
              text: '보조 콘텐츠(사이드바, 관련 링크 등)',
            },
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
    expect(formatMock).toHaveBeenCalledWith(
      '<{{BLANK}}>\n  <a href="/">Home</a>\n  <a href="/about">About</a>\n</{{BLANK}}>',
      'html',
    );
  });

  it('스텝을 찾지 못하면 예외를 던진다', async () => {
    findStepMock.mockResolvedValue(null);

    await expect(service.getQuizzesByStepId(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('객관식 정답을 채점한다', async () => {
    findQuizMock.mockResolvedValue({
      id: 10,
      type: 'MCQ',
      answer: { value: 'c2' },
      explanation: '설명입니다.',
    } as Quiz);

    const result = await service.submitQuiz(
      10,
      {
        quiz_id: 10,
        type: 'MCQ',
        selection: { option_id: 'c2' },
      },
      null,
    );

    expect(result).toEqual({
      quiz_id: 10,
      is_correct: true,
      solution: {
        correct_option_id: 'c2',
        explanation: '설명입니다.',
      },
    });
  });

  it('매칭 정답을 채점한다', async () => {
    findQuizMock.mockResolvedValue({
      id: 11,
      type: 'MATCHING',
      answer: {
        pairs: [
          { left: 'div p', right: 'div의 모든 자손 p' },
          { left: 'div > p', right: 'div의 직계 자식 p' },
        ],
      },
      explanation: '매칭 설명',
    } as Quiz);

    const result = await service.submitQuiz(
      11,
      {
        quiz_id: 11,
        type: 'MATCHING',
        selection: {
          pairs: [{ left: 'div > p', right: 'div의 직계 자식 p' }],
        },
      },
      null,
    );

    expect(result).toEqual({
      quiz_id: 11,
      is_correct: true,
      solution: {
        correct_pairs: [
          { left: 'div p', right: 'div의 모든 자손 p' },
          { left: 'div > p', right: 'div의 직계 자식 p' },
        ],
        explanation: '매칭 설명',
      },
    });
  });

  it('퀴즈가 없으면 예외를 던진다', async () => {
    findQuizMock.mockResolvedValue(null);

    await expect(
      service.submitQuiz(
        999,
        {
          quiz_id: 999,
          type: 'MCQ',
          selection: { option_id: 'c1' },
        },
        null,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
