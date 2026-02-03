import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserFollows1769800000000 implements MigrationInterface {
  name = 'AddUserFollows1769800000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user_follows\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`follower_id\` bigint NOT NULL, \`following_id\` bigint NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_user_follows_follower_following_unique\` (\`follower_id\`, \`following_id\`), INDEX \`IDX_user_follows_follower\` (\`follower_id\`), INDEX \`IDX_user_follows_following\` (\`following_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_follows\` ADD CONSTRAINT \`FK_user_follows_follower\` FOREIGN KEY (\`follower_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_follows\` ADD CONSTRAINT \`FK_user_follows_following\` FOREIGN KEY (\`following_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_follows\` DROP FOREIGN KEY \`FK_user_follows_following\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_follows\` DROP FOREIGN KEY \`FK_user_follows_follower\``,
    );
    await queryRunner.query(`DROP INDEX \`IDX_user_follows_following\` ON \`user_follows\``);
    await queryRunner.query(`DROP INDEX \`IDX_user_follows_follower\` ON \`user_follows\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_user_follows_follower_following_unique\` ON \`user_follows\``,
    );
    await queryRunner.query(`DROP TABLE \`user_follows\``);
  }
}
