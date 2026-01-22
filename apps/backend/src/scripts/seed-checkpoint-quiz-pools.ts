import type { QueryRunner } from 'typeorm';

import 'reflect-metadata';

import { AppDataSource } from '../config/typeorm.data-source';

/**
 * 체크포인트 퀴즈 풀을 생성한다.
 * - 중간 점검(4): 1,2,3 스텝 문제
 * - 최종 점검(7): 1,2,3,5,6 스텝 문제
 *
 * @returns {Promise<void>} 작업 완료
 */
async function seedCheckpointQuizPools(): Promise<void> {
  const dataSource = await AppDataSource.initialize();
  const queryRunner = dataSource.createQueryRunner();

  try {
    const tableExists = await hasCheckpointPoolTable(queryRunner);
    if (!tableExists) {
      console.warn('[seed] checkpoint_quiz_pools 테이블이 없어 작업을 건너뜁니다.');
      return;
    }

    await shiftOrderIndexForCheckpointSteps(queryRunner);
    await upsertCheckpointSteps(queryRunner);
    await fillMidCheckpointPools(queryRunner);
    await fillFinalCheckpointPools(queryRunner);
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

/**
 * 체크포인트 풀 테이블 존재 여부를 확인한다.
 *
 * @param queryRunner QueryRunner
 * @returns 테이블 존재 여부
 */
async function hasCheckpointPoolTable(queryRunner: QueryRunner): Promise<boolean> {
  const rows = await queryRunner.query(
    `
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'checkpoint_quiz_pools'
    LIMIT 1
    `,
  );

  return rows.length > 0;
}

/**
 * 체크포인트 스텝이 없는 유닛만 order_index를 이동한다.
 *
 * @param queryRunner QueryRunner
 */
async function shiftOrderIndexForCheckpointSteps(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(
    `
    UPDATE steps AS s
    JOIN (
      SELECT unit_id
      FROM (
        SELECT
          unit_id,
          SUM(
            CASE
              WHEN is_checkpoint = 1 AND order_index IN (4, 7) THEN 1
              ELSE 0
            END
          ) AS checkpoint_count,
          SUM(
            CASE
              WHEN is_checkpoint = 0 THEN 1
              ELSE 0
            END
          ) AS normal_step_count
        FROM steps
        GROUP BY unit_id
      ) AS unit_checkpoints
      WHERE unit_checkpoints.checkpoint_count = 0
        AND unit_checkpoints.normal_step_count > 0
    ) AS units_without_checkpoint
      ON units_without_checkpoint.unit_id = s.unit_id
    SET s.order_index = s.order_index + 1
    WHERE s.is_checkpoint = 0
      AND s.order_index IN (4, 5)
    `,
  );
}

/**
 * 중간/최종 점검 스텝을 유닛 단위로 추가한다.
 *
 * @param queryRunner QueryRunner
 */
async function upsertCheckpointSteps(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(
    `
    INSERT INTO steps (unit_id, title, order_index, is_checkpoint, created_at, updated_at)
    SELECT u.id, '중간 점검', 4, 1, NOW(), NOW()
    FROM units AS u
    JOIN (
      SELECT DISTINCT unit_id
      FROM steps
      WHERE is_checkpoint = 0
    ) AS units_with_steps
      ON units_with_steps.unit_id = u.id
    ON DUPLICATE KEY UPDATE
      order_index = VALUES(order_index),
      is_checkpoint = VALUES(is_checkpoint),
      updated_at = VALUES(updated_at)
    `,
  );

  await queryRunner.query(
    `
    INSERT INTO steps (unit_id, title, order_index, is_checkpoint, created_at, updated_at)
    SELECT u.id, '최종 점검', 7, 1, NOW(), NOW()
    FROM units AS u
    JOIN (
      SELECT DISTINCT unit_id
      FROM steps
      WHERE is_checkpoint = 0
    ) AS units_with_steps
      ON units_with_steps.unit_id = u.id
    ON DUPLICATE KEY UPDATE
      order_index = VALUES(order_index),
      is_checkpoint = VALUES(is_checkpoint),
      updated_at = VALUES(updated_at)
    `,
  );
}

/**
 * 중간 점검 풀(1,2,3 스텝)을 적재한다.
 *
 * @param queryRunner QueryRunner
 */
async function fillMidCheckpointPools(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(
    `
    INSERT INTO checkpoint_quiz_pools (checkpoint_step_id, quiz_id)
    SELECT mid.id, q.id
    FROM steps AS mid
    JOIN steps AS s ON s.unit_id = mid.unit_id
    JOIN quizzes AS q ON q.step_id = s.id
    WHERE mid.is_checkpoint = 1
      AND mid.order_index = 4
      AND s.is_checkpoint = 0
      AND s.order_index IN (1, 2, 3)
      AND NOT EXISTS (
        SELECT 1
        FROM checkpoint_quiz_pools AS p
        WHERE p.checkpoint_step_id = mid.id
          AND p.quiz_id = q.id
      )
    `,
  );
}

/**
 * 최종 점검 풀(1,2,3,5,6 스텝)을 적재한다.
 *
 * @param queryRunner QueryRunner
 */
async function fillFinalCheckpointPools(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(
    `
    INSERT INTO checkpoint_quiz_pools (checkpoint_step_id, quiz_id)
    SELECT fin.id, q.id
    FROM steps AS fin
    JOIN steps AS s ON s.unit_id = fin.unit_id
    JOIN quizzes AS q ON q.step_id = s.id
    WHERE fin.is_checkpoint = 1
      AND fin.order_index = 7
      AND s.is_checkpoint = 0
      AND s.order_index IN (1, 2, 3, 5, 6)
      AND NOT EXISTS (
        SELECT 1
        FROM checkpoint_quiz_pools AS p
        WHERE p.checkpoint_step_id = fin.id
          AND p.quiz_id = q.id
      )
    `,
  );
}

seedCheckpointQuizPools().catch(error => {
  // 체크포인트 시드 실패 시 원인을 남기고 종료한다.
  console.error('[seed-checkpoint] 실패:', error);
  process.exit(1);
});
