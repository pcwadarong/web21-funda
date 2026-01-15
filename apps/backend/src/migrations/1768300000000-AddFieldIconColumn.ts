import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldIconColumn1768300000000 implements MigrationInterface {
  name = 'AddFieldIconColumn1768300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasIconColumn = await queryRunner.hasColumn('fields', 'icon');
    if (hasIconColumn) {
      return;
    }

    await queryRunner.query(`ALTER TABLE \`fields\` ADD \`icon\` varchar(200) NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasIconColumn = await queryRunner.hasColumn('fields', 'icon');
    if (!hasIconColumn) {
      return;
    }

    await queryRunner.query(`ALTER TABLE \`fields\` DROP COLUMN \`icon\``);
  }
}
