import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUnitOverview1769597399532 implements MigrationInterface {
  name = 'AddUnitOverview1769597399532';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`units\` ADD \`overview\` text NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`units\` DROP COLUMN \`overview\``);
  }
}
