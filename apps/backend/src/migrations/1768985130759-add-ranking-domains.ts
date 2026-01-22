import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRankingDomains1768985130759 implements MigrationInterface {
  name = 'AddRankingDomains1768985130759';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`solve_logs\` DROP FOREIGN KEY \`FK_solve_logs_attempt\``,
    );
    await queryRunner.query(`ALTER TABLE \`reports\` DROP FOREIGN KEY \`FK_reports_quiz\``);
    await queryRunner.query(
      `ALTER TABLE \`checkpoint_quiz_pools\` DROP FOREIGN KEY \`FK_checkpoint_quiz_pools_quiz\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`checkpoint_quiz_pools\` DROP FOREIGN KEY \`FK_checkpoint_quiz_pools_step\``,
    );
    await queryRunner.query(
      `CREATE TABLE \`ranking_tiers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` enum ('BRONZE', 'SILVER', 'GOLD', 'SAPPHIRE', 'RUBY', 'MASTER') NOT NULL, \`order_index\` int NOT NULL, \`max_group_size\` int NOT NULL DEFAULT '10', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_ranking_tiers_name_unique\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`ranking_weeks\` (\`id\` int NOT NULL AUTO_INCREMENT, \`week_key\` varchar(10) NOT NULL, \`starts_at\` datetime NOT NULL, \`ends_at\` datetime NOT NULL, \`status\` enum ('OPEN', 'LOCKED', 'EVALUATED', 'ARCHIVED') NOT NULL, \`evaluated_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_ranking_weeks_week_key_unique\` (\`week_key\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`ranking_weekly_xp\` (\`id\` int NOT NULL AUTO_INCREMENT, \`week_id\` int NOT NULL, \`user_id\` bigint NOT NULL, \`tier_id\` int NOT NULL, \`xp\` int NOT NULL DEFAULT '0', \`solved_count\` int NOT NULL DEFAULT '0', \`first_solved_at\` datetime NULL, \`last_solved_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_ranking_weekly_xp_week_user_unique\` (\`week_id\`, \`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`ranking_tier_rules\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tier_id\` int NOT NULL, \`promote_min_xp\` int NOT NULL, \`demote_min_xp\` int NOT NULL, \`promote_ratio\` decimal(5,4) NOT NULL, \`demote_ratio\` decimal(5,4) NOT NULL, \`is_master\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_ranking_tier_rules_tier_unique\` (\`tier_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`ranking_groups\` (\`id\` int NOT NULL AUTO_INCREMENT, \`week_id\` int NOT NULL, \`tier_id\` int NOT NULL, \`group_index\` int NOT NULL, \`capacity\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_ranking_groups_week_tier_group_unique\` (\`week_id\`, \`tier_id\`, \`group_index\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`ranking_group_members\` (\`id\` int NOT NULL AUTO_INCREMENT, \`week_id\` int NOT NULL, \`tier_id\` int NOT NULL, \`group_id\` int NOT NULL, \`user_id\` bigint NOT NULL, \`joined_at\` datetime NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_ranking_group_members_group\` (\`group_id\`), UNIQUE INDEX \`IDX_ranking_group_members_week_user_unique\` (\`week_id\`, \`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`ranking_reward_histories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`week_id\` int NOT NULL, \`user_id\` bigint NOT NULL, \`tier_id\` int NOT NULL, \`reward_type\` enum ('DIAMOND') NOT NULL, \`amount\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_ranking_reward_histories_week_user\` (\`week_id\`, \`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`ranking_weekly_snapshots\` (\`id\` int NOT NULL AUTO_INCREMENT, \`week_id\` int NOT NULL, \`tier_id\` int NOT NULL, \`group_id\` int NOT NULL, \`user_id\` bigint NOT NULL, \`rank\` int NOT NULL, \`xp\` int NOT NULL, \`status\` enum ('PROMOTED', 'MAINTAINED', 'DEMOTED') NOT NULL, \`promote_cut_xp\` int NULL, \`demote_cut_xp\` int NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_ranking_weekly_snapshots_group\` (\`group_id\`), UNIQUE INDEX \`IDX_ranking_weekly_snapshots_week_user_unique\` (\`week_id\`, \`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`ranking_tier_change_histories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`week_id\` int NOT NULL, \`user_id\` bigint NOT NULL, \`from_tier_id\` int NULL, \`to_tier_id\` int NULL, \`reason\` enum ('PROMOTION', 'DEMOTION', 'MAINTAIN') NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_ranking_tier_change_histories_week_user\` (\`week_id\`, \`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(`ALTER TABLE \`users\` ADD \`current_tier_id\` int NULL`);
    await queryRunner.query(
      `DROP INDEX \`IDX_checkpoint_quiz_pool_unique\` ON \`checkpoint_quiz_pools\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`checkpoint_quiz_pools\` CHANGE \`checkpoint_step_id\` \`checkpoint_step_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`checkpoint_quiz_pools\` CHANGE \`quiz_id\` \`quiz_id\` int NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_checkpoint_quiz_pool_unique\` ON \`checkpoint_quiz_pools\` (\`checkpoint_step_id\`, \`quiz_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD CONSTRAINT \`FK_44d04bbce85e9a243610e8a60b9\` FOREIGN KEY (\`current_tier_id\`) REFERENCES \`ranking_tiers\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`solve_logs\` ADD CONSTRAINT \`FK_fd1c4132c632a8a1ea4cb57afa1\` FOREIGN KEY (\`user_step_attempt_id\`) REFERENCES \`user_step_attempts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_weekly_xp\` ADD CONSTRAINT \`FK_388c129393dd123fd1a658e8780\` FOREIGN KEY (\`week_id\`) REFERENCES \`ranking_weeks\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_weekly_xp\` ADD CONSTRAINT \`FK_b3df171e960de571c394b6c038e\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_weekly_xp\` ADD CONSTRAINT \`FK_3d39dc58ba5b6b5b2261ea7b3d9\` FOREIGN KEY (\`tier_id\`) REFERENCES \`ranking_tiers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`checkpoint_quiz_pools\` ADD CONSTRAINT \`FK_6d96ee38dd331dccb500c8ea6ea\` FOREIGN KEY (\`checkpoint_step_id\`) REFERENCES \`steps\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`checkpoint_quiz_pools\` ADD CONSTRAINT \`FK_286ca140752b4667e0e9f8d43ea\` FOREIGN KEY (\`quiz_id\`) REFERENCES \`quizzes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_tier_rules\` ADD CONSTRAINT \`FK_d70c765f1f23dff6b065606fa47\` FOREIGN KEY (\`tier_id\`) REFERENCES \`ranking_tiers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_groups\` ADD CONSTRAINT \`FK_5ab1b92bb52293a74be01dcbae9\` FOREIGN KEY (\`week_id\`) REFERENCES \`ranking_weeks\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_groups\` ADD CONSTRAINT \`FK_23b0ac87ce97163b9d1eb084e29\` FOREIGN KEY (\`tier_id\`) REFERENCES \`ranking_tiers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_group_members\` ADD CONSTRAINT \`FK_4e529c1d7f82b6f55df5165b016\` FOREIGN KEY (\`week_id\`) REFERENCES \`ranking_weeks\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_group_members\` ADD CONSTRAINT \`FK_84caf1510c2887b9033a2a1e81f\` FOREIGN KEY (\`tier_id\`) REFERENCES \`ranking_tiers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_group_members\` ADD CONSTRAINT \`FK_d1d5f6697a4740f93046ef2c166\` FOREIGN KEY (\`group_id\`) REFERENCES \`ranking_groups\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_group_members\` ADD CONSTRAINT \`FK_ab7d2daab72e73cfb877a9853aa\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_reward_histories\` ADD CONSTRAINT \`FK_29a1a12e5ca98b15a078d8a99d1\` FOREIGN KEY (\`week_id\`) REFERENCES \`ranking_weeks\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_reward_histories\` ADD CONSTRAINT \`FK_16e366eb71b52316e430d746b73\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_reward_histories\` ADD CONSTRAINT \`FK_bbdf4f43a8a33994bb51309c6ba\` FOREIGN KEY (\`tier_id\`) REFERENCES \`ranking_tiers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_weekly_snapshots\` ADD CONSTRAINT \`FK_c2a7b5db744a29a8964ee750dd7\` FOREIGN KEY (\`week_id\`) REFERENCES \`ranking_weeks\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_weekly_snapshots\` ADD CONSTRAINT \`FK_9ac7f1c8cb3b67ee4c88e46c0ce\` FOREIGN KEY (\`tier_id\`) REFERENCES \`ranking_tiers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_weekly_snapshots\` ADD CONSTRAINT \`FK_dd50ccbb5132a6d01903feaf4ce\` FOREIGN KEY (\`group_id\`) REFERENCES \`ranking_groups\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_weekly_snapshots\` ADD CONSTRAINT \`FK_e70d734171777178116798da6f9\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_tier_change_histories\` ADD CONSTRAINT \`FK_083fc02abea7dabb3ecb6acae55\` FOREIGN KEY (\`week_id\`) REFERENCES \`ranking_weeks\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_tier_change_histories\` ADD CONSTRAINT \`FK_a53128c44e8cb3059586c156d3b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_tier_change_histories\` ADD CONSTRAINT \`FK_97635e594315943c85d1651039c\` FOREIGN KEY (\`from_tier_id\`) REFERENCES \`ranking_tiers\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_tier_change_histories\` ADD CONSTRAINT \`FK_b87af318a71e1f3d2791064a90a\` FOREIGN KEY (\`to_tier_id\`) REFERENCES \`ranking_tiers\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`ranking_tier_change_histories\` DROP FOREIGN KEY \`FK_b87af318a71e1f3d2791064a90a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_tier_change_histories\` DROP FOREIGN KEY \`FK_97635e594315943c85d1651039c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_tier_change_histories\` DROP FOREIGN KEY \`FK_a53128c44e8cb3059586c156d3b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_tier_change_histories\` DROP FOREIGN KEY \`FK_083fc02abea7dabb3ecb6acae55\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_weekly_snapshots\` DROP FOREIGN KEY \`FK_e70d734171777178116798da6f9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_weekly_snapshots\` DROP FOREIGN KEY \`FK_dd50ccbb5132a6d01903feaf4ce\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_weekly_snapshots\` DROP FOREIGN KEY \`FK_9ac7f1c8cb3b67ee4c88e46c0ce\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_weekly_snapshots\` DROP FOREIGN KEY \`FK_c2a7b5db744a29a8964ee750dd7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_reward_histories\` DROP FOREIGN KEY \`FK_bbdf4f43a8a33994bb51309c6ba\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_reward_histories\` DROP FOREIGN KEY \`FK_16e366eb71b52316e430d746b73\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_reward_histories\` DROP FOREIGN KEY \`FK_29a1a12e5ca98b15a078d8a99d1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_group_members\` DROP FOREIGN KEY \`FK_ab7d2daab72e73cfb877a9853aa\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_group_members\` DROP FOREIGN KEY \`FK_d1d5f6697a4740f93046ef2c166\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_group_members\` DROP FOREIGN KEY \`FK_84caf1510c2887b9033a2a1e81f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_group_members\` DROP FOREIGN KEY \`FK_4e529c1d7f82b6f55df5165b016\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_groups\` DROP FOREIGN KEY \`FK_23b0ac87ce97163b9d1eb084e29\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_groups\` DROP FOREIGN KEY \`FK_5ab1b92bb52293a74be01dcbae9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_tier_rules\` DROP FOREIGN KEY \`FK_d70c765f1f23dff6b065606fa47\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`checkpoint_quiz_pools\` DROP FOREIGN KEY \`FK_286ca140752b4667e0e9f8d43ea\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`checkpoint_quiz_pools\` DROP FOREIGN KEY \`FK_6d96ee38dd331dccb500c8ea6ea\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_weekly_xp\` DROP FOREIGN KEY \`FK_3d39dc58ba5b6b5b2261ea7b3d9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_weekly_xp\` DROP FOREIGN KEY \`FK_b3df171e960de571c394b6c038e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ranking_weekly_xp\` DROP FOREIGN KEY \`FK_388c129393dd123fd1a658e8780\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`solve_logs\` DROP FOREIGN KEY \`FK_fd1c4132c632a8a1ea4cb57afa1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_44d04bbce85e9a243610e8a60b9\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_checkpoint_quiz_pool_unique\` ON \`checkpoint_quiz_pools\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`checkpoint_quiz_pools\` CHANGE \`quiz_id\` \`quiz_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`checkpoint_quiz_pools\` CHANGE \`checkpoint_step_id\` \`checkpoint_step_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_checkpoint_quiz_pool_unique\` ON \`checkpoint_quiz_pools\` (\`checkpoint_step_id\`, \`quiz_id\`)`,
    );
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`current_tier_id\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_ranking_tier_change_histories_week_user\` ON \`ranking_tier_change_histories\``,
    );
    await queryRunner.query(`DROP TABLE \`ranking_tier_change_histories\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_ranking_weekly_snapshots_week_user_unique\` ON \`ranking_weekly_snapshots\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_ranking_weekly_snapshots_group\` ON \`ranking_weekly_snapshots\``,
    );
    await queryRunner.query(`DROP TABLE \`ranking_weekly_snapshots\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_ranking_reward_histories_week_user\` ON \`ranking_reward_histories\``,
    );
    await queryRunner.query(`DROP TABLE \`ranking_reward_histories\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_ranking_group_members_week_user_unique\` ON \`ranking_group_members\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_ranking_group_members_group\` ON \`ranking_group_members\``,
    );
    await queryRunner.query(`DROP TABLE \`ranking_group_members\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_ranking_groups_week_tier_group_unique\` ON \`ranking_groups\``,
    );
    await queryRunner.query(`DROP TABLE \`ranking_groups\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_ranking_tier_rules_tier_unique\` ON \`ranking_tier_rules\``,
    );
    await queryRunner.query(`DROP TABLE \`ranking_tier_rules\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_ranking_weekly_xp_week_user_unique\` ON \`ranking_weekly_xp\``,
    );
    await queryRunner.query(`DROP TABLE \`ranking_weekly_xp\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_ranking_weeks_week_key_unique\` ON \`ranking_weeks\``,
    );
    await queryRunner.query(`DROP TABLE \`ranking_weeks\``);
    await queryRunner.query(`DROP INDEX \`IDX_ranking_tiers_name_unique\` ON \`ranking_tiers\``);
    await queryRunner.query(`DROP TABLE \`ranking_tiers\``);
    await queryRunner.query(
      `ALTER TABLE \`checkpoint_quiz_pools\` ADD CONSTRAINT \`FK_checkpoint_quiz_pools_step\` FOREIGN KEY (\`checkpoint_step_id\`) REFERENCES \`steps\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`checkpoint_quiz_pools\` ADD CONSTRAINT \`FK_checkpoint_quiz_pools_quiz\` FOREIGN KEY (\`quiz_id\`) REFERENCES \`quizzes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`reports\` ADD CONSTRAINT \`FK_reports_quiz\` FOREIGN KEY (\`quiz_id\`) REFERENCES \`quizzes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`solve_logs\` ADD CONSTRAINT \`FK_solve_logs_attempt\` FOREIGN KEY (\`user_step_attempt_id\`) REFERENCES \`user_step_attempts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
