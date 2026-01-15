import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/fields', () =>
    HttpResponse.json({
      fields: [
        {
          slug: 'frontend',
          name: '프론트엔드',
          description: '사용자 인터페이스와 웹 프론트엔드 개발',
          icon: 'Frontend',
        },
        {
          slug: 'backend',
          name: '백엔드',
          description: '서버와 데이터베이스, API 개발',
          icon: 'Backend',
        },
        {
          slug: 'mobile',
          name: '모바일',
          description: 'iOS와 Android 모바일 앱 개발',
          icon: 'Mobile',
        },
        {
          slug: 'cs',
          name: 'CS 기초',
          description: '컴퓨터 과학 기초 지식',
          icon: 'ComputerScience',
        },
        {
          slug: 'algorithm',
          name: '알고리즘',
          description: '문제 해결을 위한 알고리즘 학습',
          icon: 'Algorithm',
        },
        {
          slug: 'game',
          name: '게임 개발',
          description: '게임 엔진과 게임 로직 개발',
          icon: 'Game',
        },
        {
          slug: 'data',
          name: '데이터/AI 기초',
          description: '데이터 분석과 인공지능 기초',
          icon: 'Data',
        },
        {
          slug: 'devops',
          name: '데브옵스',
          description: 'CI/CD, 인프라 자동화 및 배포',
          icon: 'Cloud',
        },
      ],
    }),
  ),
  http.get('/api/fields/:fieldSlug/units', ({ params }) => {
    const fieldSlug = String(params.fieldSlug ?? '');

    return HttpResponse.json({
      field: {
        name: '프론트엔드',
        slug: fieldSlug,
      },
      units: [
        {
          id: 1,
          title: 'HTML 기초',
          orderIndex: 1,
          steps: [
            {
              id: 101,
              title: 'HTML 구조 이해',
              orderIndex: 1,
              quizCount: 5,
              isCheckpoint: false,
              isCompleted: true,
              isLocked: false,
            },
            {
              id: 102,
              title: '시맨틱 태그',
              orderIndex: 2,
              quizCount: 4,
              isCheckpoint: false,
              isCompleted: true,
              isLocked: false,
            },
            {
              id: 103,
              title: '폼 요소',
              orderIndex: 3,
              quizCount: 4,
              isCheckpoint: false,
              isCompleted: true,
              isLocked: false,
            },
            {
              id: 104,
              title: '중간 점검',
              orderIndex: 4,
              quizCount: 6,
              isCheckpoint: true,
              isCompleted: false,
              isLocked: false,
            },
            {
              id: 105,
              title: '미디어 태그',
              orderIndex: 5,
              quizCount: 3,
              isCheckpoint: false,
              isCompleted: false,
              isLocked: false,
            },
            {
              id: 106,
              title: '접근성 기초',
              orderIndex: 6,
              quizCount: 4,
              isCheckpoint: false,
              isCompleted: false,
              isLocked: false,
            },
            {
              id: 107,
              title: '최종 점검',
              orderIndex: 7,
              quizCount: 6,
              isCheckpoint: true,
              isCompleted: false,
              isLocked: true,
            },
          ],
        },
        {
          id: 2,
          title: 'CSS 기초',
          orderIndex: 2,
          steps: [
            {
              id: 201,
              title: '선택자 기초',
              orderIndex: 1,
              quizCount: 5,
              isCheckpoint: false,
              isCompleted: false,
              isLocked: false,
            },
            {
              id: 202,
              title: '박스 모델',
              orderIndex: 2,
              quizCount: 4,
              isCheckpoint: false,
              isCompleted: false,
              isLocked: false,
            },
            {
              id: 203,
              title: '레이아웃 기초',
              orderIndex: 3,
              quizCount: 4,
              isCheckpoint: false,
              isCompleted: false,
              isLocked: false,
            },
            {
              id: 204,
              title: '중간 점검',
              orderIndex: 4,
              quizCount: 6,
              isCheckpoint: true,
              isCompleted: false,
              isLocked: true,
            },
            {
              id: 205,
              title: '포지셔닝',
              orderIndex: 5,
              quizCount: 5,
              isCheckpoint: false,
              isCompleted: false,
              isLocked: false,
            },
            {
              id: 206,
              title: '색상과 타이포',
              orderIndex: 6,
              quizCount: 3,
              isCheckpoint: false,
              isCompleted: false,
              isLocked: false,
            },
            {
              id: 207,
              title: '최종 점검',
              orderIndex: 7,
              quizCount: 6,
              isCheckpoint: true,
              isCompleted: false,
              isLocked: true,
            },
          ],
        },
        {
          id: 3,
          title: 'CSS 심화',
          orderIndex: 3,
          steps: [
            {
              id: 301,
              title: 'Flex 심화',
              orderIndex: 1,
              quizCount: 5,
              isCheckpoint: false,
              isCompleted: false,
              isLocked: false,
            },
            {
              id: 302,
              title: 'Grid 심화',
              orderIndex: 2,
              quizCount: 4,
              isCheckpoint: false,
              isCompleted: false,
              isLocked: false,
            },
            {
              id: 303,
              title: '트랜지션',
              orderIndex: 3,
              quizCount: 4,
              isCheckpoint: false,
              isCompleted: false,
              isLocked: false,
            },
            {
              id: 304,
              title: '중간 점검',
              orderIndex: 4,
              quizCount: 6,
              isCheckpoint: true,
              isCompleted: false,
              isLocked: true,
            },
            {
              id: 305,
              title: '애니메이션',
              orderIndex: 5,
              quizCount: 4,
              isCheckpoint: false,
              isCompleted: false,
              isLocked: false,
            },
            {
              id: 306,
              title: '반응형 설계',
              orderIndex: 6,
              quizCount: 5,
              isCheckpoint: false,
              isCompleted: false,
              isLocked: false,
            },
            {
              id: 307,
              title: '최종 점검',
              orderIndex: 7,
              quizCount: 6,
              isCheckpoint: true,
              isCompleted: false,
              isLocked: false,
            },
          ],
        },
      ],
    });
  }),
  http.get('/api/fields/:fieldSlug/units/first', ({ params }) => {
    const fieldSlug = String(params.fieldSlug ?? '');

    return HttpResponse.json({
      field: {
        name: '프론트엔드',
        slug: fieldSlug,
      },
      unit: {
        id: 1,
        title: 'HTML 기초',
        orderIndex: 1,
        steps: [
          {
            id: 1,
            title: 'HTML 구조 이해',
            orderIndex: 1,
            quizCount: 5,
            isCheckpoint: false,
            isCompleted: true,
            isLocked: false,
          },
        ],
      },
    });
  }),
  http.get('/api/fields/:fieldSlug/roadmap', () =>
    HttpResponse.json({
      field: {
        name: '프론트엔드',
      },
      units: [
        {
          id: 1,
          title: 'HTML 기초',
          description: 'HTML 기초를 학습합니다',
          progress: 50,
          score: 85,
          status: 'active',
          variant: 'full',
        },
        {
          id: 2,
          title: 'CSS 기초',
          description: 'CSS 기초를 학습합니다',
          progress: 0,
          score: 0,
          status: 'normal',
          variant: 'compact',
        },
      ],
    }),
  ),
  http.get('/api/steps/:stepId/quizzes', () =>
    HttpResponse.json([
      {
        id: 1,
        type: 'ox',
        content: {
          question: ':nth-child(2)는 같은 타입(type)의 두 번째 요소만 선택한다.',
          options: [
            { id: 'o', text: 'O' },
            { id: 'x', text: 'X' },
          ],
        },
      },
      {
        id: 2,
        type: 'mcq',
        content: {
          question: ':not(.active)는 어떤 요소를 선택하는가?',
          options: [
            { id: 'c1', text: 'active 클래스를 가진 요소' },
            { id: 'c2', text: 'active 클래스를 가지지 않은 요소' },
            { id: 'c3', text: 'active 클래스를 가진 자식 요소' },
            { id: 'c4', text: 'active 클래스를 가진 형제 요소' },
          ],
        },
      },
      {
        id: 3,
        type: 'matching',
        content: {
          question: '선택자와 의미를 올바르게 연결하세요.',
          matching_metadata: {
            left: ['div p', 'div > p', 'h1 + p', 'h1 ~ p'],
            right: [
              'div의 모든 자손 p',
              'div의 직계 자식 p',
              'h1 바로 다음 p',
              'h1 뒤의 모든 형제 p',
            ],
          },
        },
      },
      {
        id: 4,
        type: 'code',
        content: {
          question:
            'data-state가 "open"인 요소만 선택하려고 합니다. 빈칸에 들어갈 선택자를 고르세요.',
          options: [
            { id: 'c1', text: '[data-state="open"]' },
            { id: 'c2', text: '[data-state^="open"]' },
            { id: 'c3', text: '[data-state*="open"]' },
            { id: 'c4', text: '[data-state$="open"]' },
          ],
          code_metadata: {
            language: 'css',
            snippet: '{{BLANK}} {\n  opacity: 1;\n}',
          },
        },
      },
      {
        id: 5,
        type: 'mcq',
        content: {
          question: '가상 요소(pseudo-element)로 올바른 것은?',
          options: [
            { id: 'c1', text: ':hover' },
            { id: 'c2', text: '::before' },
            { id: 'c3', text: ':nth-child(2)' },
            { id: 'c4', text: ':not(.a)' },
          ],
        },
      },
    ]),
  ),
  http.post('/api/quizzes/:quizId/submissions', () =>
    HttpResponse.json({
      solution: {
        explanation: '정답입니다!',
        correct_option_id: 'o',
      },
    }),
  ),
];
