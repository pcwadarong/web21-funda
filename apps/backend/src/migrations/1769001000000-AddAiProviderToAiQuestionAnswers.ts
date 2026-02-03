import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAiProviderToAiQuestionAnswers1769001000000 implements MigrationInterface {
  name = 'AddAiProviderToAiQuestionAnswers1769001000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`ai_question_answers\` ADD \`provider\` enum ('clova', 'gemini') NOT NULL DEFAULT 'clova'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`ai_question_answers\` DROP COLUMN \`provider\``);
  }
}
