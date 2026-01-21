import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSrsColumnsToProgress1768310000000 implements MigrationInterface {
  name = 'AddSrsColumnsToProgress1768310000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user_quiz_statuses` ADD `last_quality` int NULL');
    await queryRunner.query(
      'ALTER TABLE `user_quiz_statuses` ADD `review_count` int NOT NULL DEFAULT 0',
    );
    await queryRunner.query(
      'ALTER TABLE `user_quiz_statuses` ADD `lapse_count` int NOT NULL DEFAULT 0',
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_user_quiz_status_user_next_review` ON `user_quiz_statuses` (`user_id`, `next_review_at`)',
    );
    await queryRunner.query('ALTER TABLE `solve_logs` ADD `quality` int NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `solve_logs` DROP COLUMN `quality`');
    await queryRunner.query(
      'DROP INDEX `IDX_user_quiz_status_user_next_review` ON `user_quiz_statuses`',
    );
    await queryRunner.query('ALTER TABLE `user_quiz_statuses` DROP COLUMN `lapse_count`');
    await queryRunner.query('ALTER TABLE `user_quiz_statuses` DROP COLUMN `review_count`');
    await queryRunner.query('ALTER TABLE `user_quiz_statuses` DROP COLUMN `last_quality`');
  }
}
