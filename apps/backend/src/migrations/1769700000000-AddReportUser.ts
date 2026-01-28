import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReportUser1769700000000 implements MigrationInterface {
  name = 'AddReportUser1769700000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`reports\` ADD COLUMN \`user_id\` bigint NULL AFTER \`quiz_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reports\` ADD CONSTRAINT \`FK_reports_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`reports\` DROP FOREIGN KEY \`FK_reports_user\``);
    await queryRunner.query(`ALTER TABLE \`reports\` DROP COLUMN \`user_id\``);
  }
}
