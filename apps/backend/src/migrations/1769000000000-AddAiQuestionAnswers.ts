import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAiQuestionAnswers1769000000000 implements MigrationInterface {
  name = 'AddAiQuestionAnswers1769000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`ai_question_answers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`quiz_id\` int NOT NULL, \`user_id\` bigint NOT NULL, \`user_question\` text NOT NULL, \`ai_answer\` text NULL, \`status\` enum ('pending', 'completed', 'failed') NOT NULL DEFAULT 'completed', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_ai_question_answers_quiz\` (\`quiz_id\`), INDEX \`IDX_ai_question_answers_quiz_created\` (\`quiz_id\`, \`created_at\`), INDEX \`IDX_ai_question_answers_user\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ai_question_answers\` ADD CONSTRAINT \`FK_ai_question_answers_quiz\` FOREIGN KEY (\`quiz_id\`) REFERENCES \`quizzes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`ai_question_answers\` DROP FOREIGN KEY \`FK_ai_question_answers_quiz\``,
    );
    await queryRunner.query(`DROP TABLE \`ai_question_answers\``);
  }
}
