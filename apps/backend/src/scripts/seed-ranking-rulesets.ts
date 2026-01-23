import 'reflect-metadata';

import { AppDataSource } from '../config/typeorm.data-source';

/**
 * 랭킹 티어와 룰셋 기본값을 삽입한다.
 * 정책이 바뀌더라도 기준 데이터를 빠르게 갱신하기 위해 분리한다.
 *
 * @returns {Promise<void>} 작업 완료
 */
async function seedRankingRulesets(): Promise<void> {
  const dataSource = await AppDataSource.initialize();
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.query(
      `
      INSERT INTO ranking_tiers (name, order_index, max_group_size)
      VALUES
        ('BRONZE', 1, 10),
        ('SILVER', 2, 10),
        ('GOLD', 3, 10),
        ('SAPPHIRE', 4, 10),
        ('RUBY', 5, 10),
        ('MASTER', 6, 10)
      ON DUPLICATE KEY UPDATE
        order_index = VALUES(order_index),
        max_group_size = VALUES(max_group_size);
      `,
    );

    // 정책 값이 확정되기 전까지는 최소한의 기본값을 유지한다.
    await queryRunner.query(
      `
      INSERT INTO ranking_tier_rules (
        tier_id,
        promote_min_xp,
        demote_min_xp,
        promote_ratio,
        demote_ratio,
        is_master
      )
      SELECT id, 100, 0, 0.2, 0.0, false FROM ranking_tiers WHERE name = 'BRONZE'
      UNION ALL SELECT id, 150, 80, 0.2, 0.2, false FROM ranking_tiers WHERE name = 'SILVER'
      UNION ALL SELECT id, 300, 90, 0.2, 0.2, false FROM ranking_tiers WHERE name = 'GOLD'
      UNION ALL SELECT id, 450, 100, 0.2, 0.2, false FROM ranking_tiers WHERE name = 'SAPPHIRE'
      UNION ALL SELECT id, 550, 110, 0.2, 0.3, false FROM ranking_tiers WHERE name = 'RUBY'
      UNION ALL SELECT id, 99999999, 300, 0.0, 0.3, true FROM ranking_tiers WHERE name = 'MASTER'
      ON DUPLICATE KEY UPDATE
        promote_min_xp = VALUES(promote_min_xp),
        demote_min_xp = VALUES(demote_min_xp),
        promote_ratio = VALUES(promote_ratio),
        demote_ratio = VALUES(demote_ratio),
        is_master = VALUES(is_master);
      `,
    );
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

seedRankingRulesets().catch(error => {
  console.error('[seed-ranking-rulesets] 실패:', error);
  process.exit(1);
});
