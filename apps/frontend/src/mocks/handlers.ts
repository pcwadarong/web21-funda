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
];
