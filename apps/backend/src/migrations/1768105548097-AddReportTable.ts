import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReportTable1768105548097 implements MigrationInterface {
  name = 'AddReportTable1768105548097';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`reports\` (\`id\` int NOT NULL AUTO_INCREMENT, \`quiz_id\` int NOT NULL, \`report_description\` varchar(1000) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`reports\` ADD CONSTRAINT \`FK_reports_quiz\` FOREIGN KEY (\`quiz_id\`) REFERENCES \`quizzes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`reports\` DROP FOREIGN KEY \`FK_reports_quiz\``);
    await queryRunner.query(`DROP TABLE \`reports\``);
  }
}
