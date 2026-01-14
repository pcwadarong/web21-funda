import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameTotalQuestionsToTotalQuizzes1768295000000 implements MigrationInterface {
  name = 'RenameTotalQuestionsToTotalQuizzes1768295000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `user_step_attempts` CHANGE `total_questions` `total_quizzes` int NOT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `user_step_attempts` CHANGE `total_quizzes` `total_questions` int NOT NULL',
    );
  }
}
