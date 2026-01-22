import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserDiamondCount1768989900000 implements MigrationInterface {
  name = 'AddUserDiamondCount1768989900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` ADD \`diamond_count\` int NOT NULL DEFAULT '0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`diamond_count\``);
  }
}
