import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastRemindEmailSentAtToUser1768931190731 implements MigrationInterface {
  name = 'AddLastRemindEmailSentAtToUser1768931190731';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`solve_logs\` DROP FOREIGN KEY \`FK_solve_logs_attempt\``,
    );
    await queryRunner.query(`ALTER TABLE \`reports\` DROP FOREIGN KEY \`FK_reports_quiz\``);
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`is_email_subscribed\` tinyint NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`last_remind_email_sent_at\` timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`solve_logs\` ADD CONSTRAINT \`FK_fd1c4132c632a8a1ea4cb57afa1\` FOREIGN KEY (\`user_step_attempt_id\`) REFERENCES \`user_step_attempts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`solve_logs\` DROP FOREIGN KEY \`FK_fd1c4132c632a8a1ea4cb57afa1\``,
    );
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`last_remind_email_sent_at\``);
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`is_email_subscribed\``);
    await queryRunner.query(
      `ALTER TABLE \`reports\` ADD CONSTRAINT \`FK_reports_quiz\` FOREIGN KEY (\`quiz_id\`) REFERENCES \`quizzes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`solve_logs\` ADD CONSTRAINT \`FK_solve_logs_attempt\` FOREIGN KEY (\`user_step_attempt_id\`) REFERENCES \`user_step_attempts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
