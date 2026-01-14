import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStepAttemptToSolveLogs1768289999999 implements MigrationInterface {
  name = 'AddStepAttemptToSolveLogs1768289999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `solve_logs` ADD `user_step_attempt_id` int NULL');
    await queryRunner.query(
      'ALTER TABLE `solve_logs` ADD CONSTRAINT `FK_solve_logs_attempt` FOREIGN KEY (`user_step_attempt_id`) REFERENCES `user_step_attempts`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `solve_logs` DROP FOREIGN KEY `FK_solve_logs_attempt`');
    await queryRunner.query('ALTER TABLE `solve_logs` DROP COLUMN `user_step_attempt_id`');
  }
}
