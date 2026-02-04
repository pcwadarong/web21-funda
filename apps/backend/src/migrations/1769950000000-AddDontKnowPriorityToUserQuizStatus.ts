import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDontKnowPriorityToUserQuizStatus1769950000000 implements MigrationInterface {
  name = 'AddDontKnowPriorityToUserQuizStatus1769950000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_quiz_statuses\` ADD COLUMN \`is_dont_know\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user_quiz_statuses\` DROP COLUMN \`is_dont_know\``);
  }
}
