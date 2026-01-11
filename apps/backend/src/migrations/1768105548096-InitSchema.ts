import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1768105548096 implements MigrationInterface {
  name = 'InitSchema1768105548096';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user_quiz_statuses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` bigint NOT NULL, \`status\` enum ('learning', 'review', 'mastered') NOT NULL DEFAULT 'learning', \`interval\` int NOT NULL DEFAULT '0', \`ease_factor\` float NOT NULL DEFAULT '3', \`repetition\` int NOT NULL DEFAULT '0', \`next_review_at\` datetime NULL, \`last_solved_at\` datetime NULL, \`is_wrong\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`quiz_id\` int NULL, UNIQUE INDEX \`IDX_user_quiz_status_user_quiz_unique\` (\`user_id\`, \`quiz_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_step_statuses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` bigint NOT NULL, \`is_completed\` tinyint NOT NULL DEFAULT 0, \`success_rate\` decimal(5,2) NULL, \`best_score\` int NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`step_id\` int NULL, UNIQUE INDEX \`IDX_user_step_status_user_step_unique\` (\`user_id\`, \`step_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`fields\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`slug\` varchar(100) NOT NULL, \`description\` text NULL, \`icon\` varchar(200) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_fields_slug_unique\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`units\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(200) NOT NULL, \`description\` text NULL, \`order_index\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`field_id\` int NULL, UNIQUE INDEX \`IDX_units_field_title_unique\` (\`field_id\`, \`title\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`steps\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(200) NOT NULL, \`order_index\` int NOT NULL, \`is_checkpoint\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`unit_id\` int NULL, UNIQUE INDEX \`IDX_steps_unit_title_unique\` (\`unit_id\`, \`title\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`quizzes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(50) NOT NULL, \`question\` text NOT NULL, \`content\` json NOT NULL, \`answer\` json NOT NULL, \`explanation\` text NULL, \`difficulty\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`step_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`solve_logs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` bigint NOT NULL, \`is_correct\` tinyint NOT NULL, \`solved_at\` datetime NOT NULL, \`duration\` int NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`quiz_id\` int NULL, INDEX \`IDX_solve_logs_user\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_step_attempts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` bigint NOT NULL, \`attempt_no\` int NOT NULL, \`total_questions\` int NOT NULL, \`answered_count\` int NOT NULL DEFAULT '0', \`correct_count\` int NOT NULL DEFAULT '0', \`success_rate\` decimal(5,2) NULL, \`status\` enum ('in_progress', 'completed', 'abandoned') NOT NULL DEFAULT 'in_progress', \`started_at\` datetime NOT NULL, \`finished_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`step_id\` int NULL, UNIQUE INDEX \`IDX_user_step_attempt_user_step_no_unique\` (\`user_id\`, \`step_id\`, \`attempt_no\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_quiz_statuses\` ADD CONSTRAINT \`FK_3a96216842aa3acc2be35adcb19\` FOREIGN KEY (\`quiz_id\`) REFERENCES \`quizzes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_step_statuses\` ADD CONSTRAINT \`FK_f38ceb22ab0f7062bb6b702c23a\` FOREIGN KEY (\`step_id\`) REFERENCES \`steps\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`units\` ADD CONSTRAINT \`FK_f87adfc50822dcb0f5ef01efbcc\` FOREIGN KEY (\`field_id\`) REFERENCES \`fields\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`steps\` ADD CONSTRAINT \`FK_d4c8e6929228c01268ab6a36d38\` FOREIGN KEY (\`unit_id\`) REFERENCES \`units\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`quizzes\` ADD CONSTRAINT \`FK_ace78a9a9cbede52b77cc581147\` FOREIGN KEY (\`step_id\`) REFERENCES \`steps\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`solve_logs\` ADD CONSTRAINT \`FK_9bfffb0814484ea329d0e0362d6\` FOREIGN KEY (\`quiz_id\`) REFERENCES \`quizzes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_step_attempts\` ADD CONSTRAINT \`FK_e5994182ad0f704e5f11b62b932\` FOREIGN KEY (\`step_id\`) REFERENCES \`steps\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_step_attempts\` DROP FOREIGN KEY \`FK_e5994182ad0f704e5f11b62b932\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`solve_logs\` DROP FOREIGN KEY \`FK_9bfffb0814484ea329d0e0362d6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`quizzes\` DROP FOREIGN KEY \`FK_ace78a9a9cbede52b77cc581147\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`steps\` DROP FOREIGN KEY \`FK_d4c8e6929228c01268ab6a36d38\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`units\` DROP FOREIGN KEY \`FK_f87adfc50822dcb0f5ef01efbcc\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_step_statuses\` DROP FOREIGN KEY \`FK_f38ceb22ab0f7062bb6b702c23a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_quiz_statuses\` DROP FOREIGN KEY \`FK_3a96216842aa3acc2be35adcb19\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_user_step_attempt_user_step_no_unique\` ON \`user_step_attempts\``,
    );
    await queryRunner.query(`DROP TABLE \`user_step_attempts\``);
    await queryRunner.query(`DROP INDEX \`IDX_solve_logs_user\` ON \`solve_logs\``);
    await queryRunner.query(`DROP TABLE \`solve_logs\``);
    await queryRunner.query(`DROP TABLE \`quizzes\``);
    await queryRunner.query(`DROP INDEX \`IDX_steps_unit_title_unique\` ON \`steps\``);
    await queryRunner.query(`DROP TABLE \`steps\``);
    await queryRunner.query(`DROP INDEX \`IDX_units_field_title_unique\` ON \`units\``);
    await queryRunner.query(`DROP TABLE \`units\``);
    await queryRunner.query(`DROP INDEX \`IDX_fields_slug_unique\` ON \`fields\``);
    await queryRunner.query(`DROP TABLE \`fields\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_user_step_status_user_step_unique\` ON \`user_step_statuses\``,
    );
    await queryRunner.query(`DROP TABLE \`user_step_statuses\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_user_quiz_status_user_quiz_unique\` ON \`user_quiz_statuses\``,
    );
    await queryRunner.query(`DROP TABLE \`user_quiz_statuses\``);
  }
}
