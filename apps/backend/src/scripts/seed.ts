import 'reflect-metadata';

import { AppDataSource } from '../config/typeorm.data-source';

/**
 * 초기 필드/유닛 데이터를 삽입한다.
 * 마이그레이션과 분리된 시드 작업용 스크립트다.
 *
 * @returns {Promise<void>} 작업 완료
 */
async function seed(): Promise<void> {
  const dataSource = await AppDataSource.initialize();
  const queryRunner = dataSource.createQueryRunner();

  try {
    // 필드: slug 기준으로 중복을 막기 위해 upsert 사용
    await queryRunner.query(
      `
      INSERT INTO fields (name, slug, description)
      VALUES
        ('프론트엔드', 'fe', '사용자 인터페이스와 웹 프론트엔드 개발'),
        ('백엔드', 'be', '서버와 데이터베이스, API 개발'),
        ('모바일', 'mo', 'iOS와 Android 모바일 앱 개발'),
        ('CS 기초', 'cs', '컴퓨터 과학 기초 지식'),
        ('알고리즘', 'algo', '문제 해결을 위한 알고리즘 학습'),
        ('게임 개발', 'game', '게임 엔진과 게임 로직 개발'),
        ('데이터/AI 기초', 'da', '데이터 분석과 인공지능 기초'),
        ('데브옵스', 'devops', 'CI/CD, 인프라 자동화 및 배포')
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        description = VALUES(description);
      `,
    );

    // 프론트엔드 유닛: (field_id, title) 고유 제약을 고려해 upsert 사용
    await queryRunner.query(
      `
      INSERT INTO units (field_id, title, order_index)
      SELECT id, 'HTML 기초', 1 FROM fields WHERE slug = 'fe'
      UNION ALL SELECT id, 'CSS 기초', 2 FROM fields WHERE slug = 'fe'
      UNION ALL SELECT id, 'CSS 심화', 3 FROM fields WHERE slug = 'fe'
      UNION ALL SELECT id, 'JavaScript 기초', 4 FROM fields WHERE slug = 'fe'
      UNION ALL SELECT id, 'JavaScript 심화', 5 FROM fields WHERE slug = 'fe'
      UNION ALL SELECT id, '자바스크립트 비동기 처리', 6 FROM fields WHERE slug = 'fe'
      UNION ALL SELECT id, '브라우저 DOM & API', 7 FROM fields WHERE slug = 'fe'
      UNION ALL SELECT id, 'TypeScript 기초', 8 FROM fields WHERE slug = 'fe'
      UNION ALL SELECT id, '프론트엔드 개발 환경과 빌드 도구', 9 FROM fields WHERE slug = 'fe'
      UNION ALL SELECT id, 'React 기초', 10 FROM fields WHERE slug = 'fe'
      UNION ALL SELECT id, 'React 심화', 11 FROM fields WHERE slug = 'fe'
      UNION ALL SELECT id, '상태 관리', 12 FROM fields WHERE slug = 'fe'
      UNION ALL SELECT id, '프론트엔드 테스트와 디버깅', 13 FROM fields WHERE slug = 'fe'
      UNION ALL SELECT id, '웹 성능 최적화', 14 FROM fields WHERE slug = 'fe'
      UNION ALL SELECT id, '웹 보안 기초', 15 FROM fields WHERE slug = 'fe'
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        order_index = VALUES(order_index);
      `,
    );

    // 백엔드 유닛: (field_id, title) 고유 제약을 고려해 upsert 사용
    await queryRunner.query(
      `
      INSERT INTO units (field_id, title, order_index)
      SELECT id, '백엔드 기초', 1 FROM fields WHERE slug = 'be'
      UNION ALL SELECT id, 'JavaScript 기초', 2 FROM fields WHERE slug = 'be'
      UNION ALL SELECT id, 'Node.js 기초', 3 FROM fields WHERE slug = 'be'
      UNION ALL SELECT id, 'Node.js 심화', 4 FROM fields WHERE slug = 'be'
      UNION ALL SELECT id, 'Express.js 기초', 5 FROM fields WHERE slug = 'be'
      UNION ALL SELECT id, '관계형 데이터베이스 기초', 6 FROM fields WHERE slug = 'be'
      UNION ALL SELECT id, 'NoSQL과 캐시', 7 FROM fields WHERE slug = 'be'
      UNION ALL SELECT id, '인증과 인가', 8 FROM fields WHERE slug = 'be'
      UNION ALL SELECT id, '백엔드 테스트와 디버깅', 9 FROM fields WHERE slug = 'be'
      UNION ALL SELECT id, '배포와 인프라', 10 FROM fields WHERE slug = 'be'
      UNION ALL SELECT id, '백엔드 통신 심화', 11 FROM fields WHERE slug = 'be'
      UNION ALL SELECT id, '백엔드 아키텍처', 12 FROM fields WHERE slug = 'be'
      UNION ALL SELECT id, '백엔드 아키텍처 심화', 13 FROM fields WHERE slug = 'be'
      UNION ALL SELECT id, '백엔드 성능 최적화', 14 FROM fields WHERE slug = 'be'
      UNION ALL SELECT id, '백엔드 보안', 15 FROM fields WHERE slug = 'be'
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        order_index = VALUES(order_index);
      `,
    );
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

seed().catch(error => {
  // 시드 실패 시 이유를 남기고 비정상 종료

  console.error('[seed] 실패:', error);
  process.exit(1);
});
