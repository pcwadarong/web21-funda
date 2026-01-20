import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailSubscribtionUser1768943617229 implements MigrationInterface {
  name = 'AddEmailSubscribtionUser1768943617229';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`is_email_subscribed\` tinyint NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`last_remind_email_sent_at\` datetime NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`last_remind_email_sent_at\``);
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`is_email_subscribed\``);
  }
}
