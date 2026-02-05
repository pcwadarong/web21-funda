import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserDailyGoalRewardedAt1770000000000 implements MigrationInterface {
  name = 'AddUserDailyGoalRewardedAt1770000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `users` ADD `last_daily_goal_rewarded_at` datetime NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `last_daily_goal_rewarded_at`');
  }
}
