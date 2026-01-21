import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCheckpointQuizPools1768400000000 implements MigrationInterface {
  name = 'AddCheckpointQuizPools1768400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      CREATE TABLE \`checkpoint_quiz_pools\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`checkpoint_step_id\` int NOT NULL,
        \`quiz_id\` int NOT NULL,
        UNIQUE INDEX \`IDX_checkpoint_quiz_pool_unique\` (\`checkpoint_step_id\`, \`quiz_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
      `,
    );
    await queryRunner.query(
      `
      ALTER TABLE \`checkpoint_quiz_pools\`
      ADD CONSTRAINT \`FK_checkpoint_quiz_pools_step\`
      FOREIGN KEY (\`checkpoint_step_id\`)
      REFERENCES \`steps\`(\`id\`)
      ON DELETE CASCADE
      ON UPDATE NO ACTION
      `,
    );
    await queryRunner.query(
      `
      ALTER TABLE \`checkpoint_quiz_pools\`
      ADD CONSTRAINT \`FK_checkpoint_quiz_pools_quiz\`
      FOREIGN KEY (\`quiz_id\`)
      REFERENCES \`quizzes\`(\`id\`)
      ON DELETE CASCADE
      ON UPDATE NO ACTION
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `checkpoint_quiz_pools` DROP FOREIGN KEY `FK_checkpoint_quiz_pools_quiz`',
    );
    await queryRunner.query(
      'ALTER TABLE `checkpoint_quiz_pools` DROP FOREIGN KEY `FK_checkpoint_quiz_pools_step`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_checkpoint_quiz_pool_unique` ON `checkpoint_quiz_pools`',
    );
    await queryRunner.query('DROP TABLE `checkpoint_quiz_pools`');
  }
}
