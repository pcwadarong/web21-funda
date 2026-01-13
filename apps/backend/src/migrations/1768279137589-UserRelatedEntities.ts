import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserRelatedEntities1768279137589 implements MigrationInterface {
  name = 'UserRelatedEntities1768279137589';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user_refresh_tokens\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`user_id\` bigint NOT NULL, \`token_hash\` varchar(255) NOT NULL, \`issued_at\` datetime NOT NULL, \`expires_at\` datetime NOT NULL, \`revoked_at\` datetime NULL, \`last_used_at\` datetime NULL, \`user_agent\` varchar(500) NULL, \`ip_address\` varchar(45) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_refresh_token_user\` (\`user_id\`), UNIQUE INDEX \`IDX_refresh_token_hash_unique\` (\`token_hash\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`provider\` enum ('github', 'google') NOT NULL, \`provider_user_id\` varchar(200) NOT NULL, \`email\` varchar(320) NULL, \`display_name\` varchar(100) NOT NULL, \`profile_image_url\` varchar(500) NULL, \`role\` enum ('user', 'admin') NOT NULL DEFAULT 'user', \`experience\` int NOT NULL DEFAULT '0', \`heart_count\` int NOT NULL DEFAULT '5', \`max_heart_count\` int NOT NULL DEFAULT '5', \`last_heart_synced_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`current_streak\` int NOT NULL DEFAULT '0', \`last_streak_updated_at\` datetime NULL, \`last_login_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_users_email_unique\` (\`email\`), UNIQUE INDEX \`IDX_users_provider_account_unique\` (\`provider\`, \`provider_user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_refresh_tokens\` ADD CONSTRAINT \`FK_15ffbf3cf712c581611caf2130a\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_refresh_tokens\` DROP FOREIGN KEY \`FK_15ffbf3cf712c581611caf2130a\``,
    );
    await queryRunner.query(`DROP INDEX \`IDX_users_provider_account_unique\` ON \`users\``);
    await queryRunner.query(`DROP INDEX \`IDX_users_email_unique\` ON \`users\``);
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_refresh_token_hash_unique\` ON \`user_refresh_tokens\``,
    );
    await queryRunner.query(`DROP INDEX \`IDX_refresh_token_user\` ON \`user_refresh_tokens\``);
    await queryRunner.query(`DROP TABLE \`user_refresh_tokens\``);
  }
}
