import { NotFoundException } from '@nestjs/common';
import { RedisService } from 'src/common/redis/redis.service';
import { QuizResultService } from 'src/common/utils/quiz-result.service';
import { type DataSource, type FindOneOptions, Repository } from 'typeorm';

import { CodeFormatter } from '../common/utils/code-formatter';
import { QuizContentService } from '../common/utils/quiz-content.service';
import {
  QuizLearningStatus,
  SolveLog,
  UserQuizStatus,
  UserStepAttempt,
  UserStepStatus,
} from '../progress/entities';
import { RankingService } from '../ranking/ranking.service';
import { User } from '../users/entities/user.entity';

import { CheckpointQuizPool, Field, Quiz, Step, Unit } from './entities';
import { RoadmapService } from './roadmap.service';

jest.mock('../common/utils/code-formatter');

describe('RoadmapService', () => {
  let service: RoadmapService;
  let fieldRepository: Partial<Repository<Field>>;
  let quizRepository: Partial<Repository<Quiz>>;
  let stepRepository: Partial<Repository<Step>>;
  let checkpointQuizPoolRepository: Partial<Repository<CheckpointQuizPool>>;
  let unitRepository: Partial<Repository<Unit>>;
  let solveLogRepository: Partial<Repository<SolveLog>>;
  let stepAttemptRepository: Partial<Repository<UserStepAttempt>>;
  let stepStatusRepository: Partial<Repository<UserStepStatus>>;
  let userRepository: Partial<Repository<User>>;
  let dataSource: Partial<DataSource>;
  let codeFormatter: Partial<CodeFormatter>;
  let quizContentService: QuizContentService;
  let quizResultService: Record<string, jest.Mock>;
  let rankingService: Partial<RankingService>;
  let redisService: Partial<RedisService>;
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
  let checkpointPoolQueryBuilderMock: {
    innerJoinAndSelect: jest.Mock;
    where: jest.Mock;
    orderBy: jest.Mock;
    limit: jest.Mock;
    getMany: jest.Mock;
  };
  let quizFindMock: jest.Mock;
  let formatMock: jest.Mock;
  let stepStatusFindMock: jest.Mock;
  let findUnitMock: jest.Mock<Promise<Unit | null>, [FindOneOptions<Unit>]>;
  let unitSaveMock: jest.Mock;

  beforeEach(() => {
    findFieldsMock = jest.fn();
    findFieldMock = jest.fn();
    findStepMock = jest.fn();
    findQuizMock = jest.fn();
    createQueryBuilderMock = jest.fn();
    checkpointPoolQueryBuilderMock = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };
    quizFindMock = jest.fn();
    formatMock = jest.fn().mockImplementation((code: string) => Promise.resolve(code));
    stepStatusFindMock = jest.fn();
    findUnitMock = jest.fn();
    unitSaveMock = jest.fn();
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
    checkpointQuizPoolRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(checkpointPoolQueryBuilderMock),
    };
    unitRepository = {
      findOne: findUnitMock,
      save: unitSaveMock,
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
    userRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    dataSource = {
      transaction: jest.fn(),
    };
    codeFormatter = {
      format: formatMock,
    };
    quizContentService = new QuizContentService(codeFormatter as CodeFormatter);
    rankingService = {
      assignUserToGroupOnFirstSolveWithManager: jest.fn(),
      addWeeklyXpOnSolveWithManager: jest.fn(),
    };
    quizResultService = {
      getQuizResult: jest.fn(),
      getOptionAnswer: jest.fn(),
      getMatchingAnswer: jest.fn(),
      isCorrectOption: jest.fn(),
      isCorrectMatching: jest.fn(),
      isCorrectSubjective: jest.fn(),
      isCorrectShort: jest.fn(),
      isCorrectEssay: jest.fn(),
      buildCorrectAnswer: jest.fn(),
      buildExplanation: jest.fn(),
      normalizePairs: jest.fn(),
      toAnswerObject: jest.fn(),
      isPlainObject: jest.fn(),
      toCleanString: jest.fn(),
      toStringArray: jest.fn(),
    };
    redisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    service = new RoadmapService(
      fieldRepository as Repository<Field>,
      quizRepository as Repository<Quiz>,
      stepRepository as Repository<Step>,
      checkpointQuizPoolRepository as Repository<CheckpointQuizPool>,
      unitRepository as Repository<Unit>,
      codeFormatter as CodeFormatter,
      solveLogRepository as Repository<SolveLog>,
      stepAttemptRepository as Repository<UserStepAttempt>,
      quizContentService,
      stepStatusRepository as Repository<UserStepStatus>,
      userRepository as Repository<User>,
      dataSource as DataSource,
      rankingService as RankingService,
      redisService as RedisService,
      quizResultService as unknown as QuizResultService,
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
        { id: 2, title: 'JS', orderIndex: 2, progress: 0, successRate: 0, description: '' },
        { id: 1, title: 'HTML', orderIndex: 1, progress: 0, successRate: 0, description: '' },
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

  it('유닛 개요를 응답한다', async () => {
    findUnitMock.mockResolvedValue({
      id: 1,
      title: 'HTML',
      overview: '### 소개\n\nHTML 기본을 소개합니다.',
    } as Unit);

    const result = await service.getUnitOverview(1);

    expect(result).toEqual({
      unit: {
        id: 1,
        title: 'HTML',
        overview: '### 소개\n\nHTML 기본을 소개합니다.',
      },
    });
  });

  it('유닛이 없으면 개요 조회에서 예외를 던진다', async () => {
    findUnitMock.mockResolvedValue(null);

    await expect(service.getUnitOverview(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('유닛 개요를 수정한다', async () => {
    const unit = {
      id: 1,
      title: 'HTML',
      overview: null,
    } as Unit;

    findUnitMock.mockResolvedValue(unit);
    unitSaveMock.mockImplementation(async (savedUnit: Unit) => savedUnit);

    const result = await service.updateUnitOverview(1, '### 새 개요');

    expect(unitSaveMock).toHaveBeenCalledWith({
      id: 1,
      title: 'HTML',
      overview: '### 새 개요',
    });
    expect(result).toEqual({
      unit: {
        id: 1,
        title: 'HTML',
        overview: '### 새 개요',
      },
    });
  });

  it('유닛이 없으면 개요 수정에서 예외를 던진다', async () => {
    findUnitMock.mockResolvedValue(null);

    await expect(service.updateUnitOverview(999, '### 새 개요')).rejects.toBeInstanceOf(
      NotFoundException,
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
    findStepMock.mockResolvedValue({ id: 1, isCheckpoint: false } as Step);
    const quizQueryBuilderMock = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
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
      ] as Quiz[]),
    };
    createQueryBuilderMock.mockReturnValue(quizQueryBuilderMock as never);

    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

    const result = await service.getQuizzesByStepId(1);

    randomSpy.mockRestore();

    expect(result).toHaveLength(3);
    expect(quizQueryBuilderMock.where).toHaveBeenCalledWith('quiz.step_id = :stepId', {
      stepId: 1,
    });
    const mcq = result.find(quiz => quiz.type === 'MCQ');
    const matching = result.find(quiz => quiz.type === 'MATCHING');

    expect(mcq).toMatchObject({
      id: expect.any(Number),
      type: 'MCQ',
      content: {
        question: '페이지의 주요 콘텐츠 영역을 나타내는 시멘틱 요소는?',
        options: [
          { id: 'c2', text: '<footer>' },
          { id: 'c3', text: '<aside>' },
          { id: 'c1', text: '<main>' },
        ],
      },
    });
    expect(matching).toMatchObject({
      id: expect.any(Number),
      type: 'MATCHING',
      content: {
        question: '시멘틱 태그 매칭',
        matching_metadata: {
          left: expect.arrayContaining([
            { id: '<aside>', text: '<aside>' },
            { id: '<article>', text: '<article>' },
            { id: '<nav>', text: '<nav>' },
            { id: '<header>', text: '<header>' },
          ]),
          right: expect.arrayContaining([
            {
              id: '보조 콘텐츠(사이드바, 관련 링크 등)',
              text: '보조 콘텐츠(사이드바, 관련 링크 등)',
            },
            {
              id: '독립적으로 배포/재사용 가능한 콘텐츠 단위',
              text: '독립적으로 배포/재사용 가능한 콘텐츠 단위',
            },
            { id: '내비게이션 링크 모음', text: '내비게이션 링크 모음' },
            { id: '문서/섹션의 머리말(제목, 소개 등)', text: '문서/섹션의 머리말(제목, 소개 등)' },
          ]),
        },
      },
    });
    const codeQuiz = result.find(quiz => quiz.type === 'CODE');
    expect(codeQuiz).toMatchObject({
      id: expect.any(Number),
      type: 'CODE',
      content: {
        question: '네비게이션 영역을 의미하는 시멘틱 요소는?',
        options: [
          { id: 'c2', text: 'nav' },
          { id: 'c3', text: 'section' },
          { id: 'c4', text: 'article' },
          { id: 'c5', text: 'span' },
          { id: 'c1', text: 'div' },
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

  it('체크포인트 스텝이면 풀에서 퀴즈를 조회한다', async () => {
    findStepMock.mockResolvedValue({ id: 10, isCheckpoint: true } as Step);
    checkpointPoolQueryBuilderMock.getMany.mockResolvedValue([
      { quiz: { id: 101, type: 'MCQ', question: '중간 점검 1', content: {} } },
      { quiz: { id: 102, type: 'MCQ', question: '중간 점검 2', content: {} } },
    ] as CheckpointQuizPool[]);

    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

    const result = await service.getQuizzesByStepId(10);

    randomSpy.mockRestore();

    expect(checkpointPoolQueryBuilderMock.where).toHaveBeenCalledWith(
      'pool.checkpoint_step_id = :stepId',
      {
        stepId: 10,
      },
    );
    expect(result.map(quiz => quiz.id)).toEqual([102, 101]);
  });

  it('객관식 정답을 채점한다', async () => {
    findQuizMock.mockResolvedValue({
      id: 10,
      type: 'MCQ',
      answer: { value: 'c2' },
      explanation: '설명입니다.',
    } as Quiz);
    (quizResultService.getOptionAnswer as jest.Mock).mockReturnValue('c2');
    (quizResultService.isCorrectOption as jest.Mock).mockReturnValue(true);

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
    const correctPairs = [
      { left: 'div p', right: 'div의 모든 자손 p' },
      { left: 'div > p', right: 'div의 직계 자식 p' },
    ];
    (quizResultService.getMatchingAnswer as jest.Mock).mockReturnValue(correctPairs);
    (quizResultService.isCorrectMatching as jest.Mock).mockReturnValue(true);

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

  it('정답 제출 시 SRS 상태를 갱신한다', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const quiz = {
      id: 10,
      type: 'MCQ',
      answer: { value: 'c2' },
      explanation: '설명입니다.',
      step: { id: 1 },
    } as Quiz;
    findQuizMock.mockResolvedValue(quiz);
    (quizResultService.getOptionAnswer as jest.Mock).mockReturnValue('c2');
    (quizResultService.isCorrectOption as jest.Mock).mockReturnValue(true);

    const solveLogRepository: Partial<Repository<SolveLog>> = {
      create: jest.fn().mockImplementation(log => log),
      save: jest.fn(),
    };
    const userQuizStatusRepository: Partial<Repository<UserQuizStatus>> = {
      findOne: jest.fn().mockResolvedValue({
        userId: 1,
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
      }),
      save: jest.fn(),
    };
    const stepAttemptRepository: Partial<Repository<UserStepAttempt>> = {
      findOne: jest.fn().mockResolvedValue(null),
    };
    const manager = {
      getRepository: jest.fn((entity: unknown) => {
        if (entity === SolveLog) {
          return solveLogRepository;
        }
        if (entity === UserQuizStatus) {
          return userQuizStatusRepository;
        }
        if (entity === UserStepAttempt) {
          return stepAttemptRepository;
        }
        return null;
      }),
    };
    (dataSource.transaction as jest.Mock).mockImplementation(async callback => callback(manager));

    await service.submitQuiz(
      10,
      {
        quiz_id: 10,
        type: 'MCQ',
        selection: { option_id: 'c2' },
      },
      1,
    );

    expect(solveLogRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        quiz,
        isCorrect: true,
        quality: 5,
      }),
    );

    const savedStatus = (userQuizStatusRepository.save as jest.Mock).mock.calls[0][0];
    expect(savedStatus.status).toBe(QuizLearningStatus.REVIEW);
    expect(savedStatus.repetition).toBe(1);
    expect(savedStatus.interval).toBe(1);
    expect(savedStatus.reviewCount).toBe(1);
    expect(savedStatus.lapseCount).toBe(0);
    expect(savedStatus.isWrong).toBe(false);
    expect(savedStatus.lastQuality).toBe(5);
    expect(savedStatus.easeFactor).toBeCloseTo(2.6, 5);
    expect(savedStatus.lastSolvedAt).toEqual(new Date('2026-01-01T09:00:00.000Z'));
    expect(savedStatus.nextReviewAt).toEqual(new Date('2026-01-02T09:00:00.000Z'));

    jest.useRealTimers();
  });

  it('오답 제출 시 SRS 상태를 리셋한다', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const quiz = {
      id: 11,
      type: 'MCQ',
      answer: { value: 'c1' },
      explanation: '설명입니다.',
      step: { id: 1 },
    } as Quiz;
    findQuizMock.mockResolvedValue(quiz);
    (quizResultService.getOptionAnswer as jest.Mock).mockReturnValue('c1');
    (quizResultService.isCorrectOption as jest.Mock).mockReturnValue(false);

    const solveLogRepository: Partial<Repository<SolveLog>> = {
      create: jest.fn().mockImplementation(log => log),
      save: jest.fn(),
    };
    const userQuizStatusRepository: Partial<Repository<UserQuizStatus>> = {
      findOne: jest.fn().mockResolvedValue({
        userId: 1,
        quiz,
        status: QuizLearningStatus.REVIEW,
        interval: 6,
        easeFactor: 2.5,
        repetition: 2,
        lastQuality: 5,
        reviewCount: 3,
        lapseCount: 1,
        nextReviewAt: new Date('2026-01-10T00:00:00.000Z'),
        lastSolvedAt: new Date('2025-12-31T00:00:00.000Z'),
        isWrong: false,
      }),
      save: jest.fn(),
    };
    const stepAttemptRepository: Partial<Repository<UserStepAttempt>> = {
      findOne: jest.fn().mockResolvedValue(null),
    };
    const manager = {
      getRepository: jest.fn((entity: unknown) => {
        if (entity === SolveLog) {
          return solveLogRepository;
        }
        if (entity === UserQuizStatus) {
          return userQuizStatusRepository;
        }
        if (entity === UserStepAttempt) {
          return stepAttemptRepository;
        }
        return null;
      }),
    };
    (dataSource.transaction as jest.Mock).mockImplementation(async callback => callback(manager));

    await service.submitQuiz(
      11,
      {
        quiz_id: 11,
        type: 'MCQ',
        selection: { option_id: 'c2' },
      },
      1,
    );

    expect(solveLogRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        quiz,
        isCorrect: false,
        quality: 2,
      }),
    );

    const savedStatus = (userQuizStatusRepository.save as jest.Mock).mock.calls[0][0];
    expect(savedStatus.status).toBe(QuizLearningStatus.LEARNING);
    expect(savedStatus.repetition).toBe(0);
    expect(savedStatus.interval).toBe(1);
    expect(savedStatus.reviewCount).toBe(4);
    expect(savedStatus.lapseCount).toBe(2);
    expect(savedStatus.isWrong).toBe(true);
    expect(savedStatus.lastQuality).toBe(2);
    expect(savedStatus.easeFactor).toBeCloseTo(2.18, 5);
    expect(savedStatus.lastSolvedAt).toEqual(new Date('2026-01-01T09:00:00.000Z'));
    expect(savedStatus.nextReviewAt).toEqual(new Date('2026-01-02T09:00:00.000Z'));

    jest.useRealTimers();
  });

  it('"잘 모르겠어요" 제출 시 최우선 복습 플래그를 설정한다', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const quiz = {
      id: 12,
      type: 'MCQ',
      answer: { value: 'c1' },
      explanation: '설명입니다.',
      step: { id: 1 },
    } as Quiz;
    findQuizMock.mockResolvedValue(quiz);
    (quizResultService.getOptionAnswer as jest.Mock).mockReturnValue('c1');
    (quizResultService.isCorrectOption as jest.Mock).mockReturnValue(false);

    const solveLogRepository: Partial<Repository<SolveLog>> = {
      create: jest.fn().mockImplementation(log => log),
      save: jest.fn(),
    };
    const userQuizStatusRepository: Partial<Repository<UserQuizStatus>> = {
      findOne: jest.fn().mockResolvedValue({
        userId: 1,
        quiz,
        status: QuizLearningStatus.REVIEW,
        interval: 6,
        easeFactor: 2.5,
        repetition: 2,
        lastQuality: 5,
        reviewCount: 3,
        lapseCount: 1,
        nextReviewAt: new Date('2026-01-10T00:00:00.000Z'),
        lastSolvedAt: new Date('2025-12-31T00:00:00.000Z'),
        isWrong: false,
        isDontKnow: false,
      }),
      save: jest.fn(),
    };
    const stepAttemptRepository: Partial<Repository<UserStepAttempt>> = {
      findOne: jest.fn().mockResolvedValue(null),
    };
    const manager = {
      getRepository: jest.fn((entity: unknown) => {
        if (entity === SolveLog) {
          return solveLogRepository;
        }
        if (entity === UserQuizStatus) {
          return userQuizStatusRepository;
        }
        if (entity === UserStepAttempt) {
          return stepAttemptRepository;
        }
        return null;
      }),
    };
    (dataSource.transaction as jest.Mock).mockImplementation(async callback => callback(manager));

    await service.submitQuiz(
      12,
      {
        quiz_id: 12,
        type: 'MCQ',
        selection: {},
        is_dont_know: true,
      },
      1,
    );

    const savedStatus = (userQuizStatusRepository.save as jest.Mock).mock.calls[0][0];
    expect(savedStatus.isDontKnow).toBe(true);
    expect(savedStatus.nextReviewAt).toEqual(new Date('2026-01-01T09:00:00.000Z'));

    jest.useRealTimers();
  });
});
