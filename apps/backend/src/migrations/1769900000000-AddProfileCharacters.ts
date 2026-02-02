import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfileCharacters1769900000000 implements MigrationInterface {
  name = 'AddProfileCharacters1769900000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`profile_characters\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`image_url\` varchar(500) NOT NULL, \`price_diamonds\` int NOT NULL, \`description\` text NULL, \`is_active\` boolean NOT NULL DEFAULT true, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_profile_characters\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`user_id\` bigint NOT NULL, \`character_id\` int NOT NULL, \`purchased_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_user_profile_characters_user_character_unique\` (\`user_id\`, \`character_id\`), INDEX \`IDX_user_profile_characters_user\` (\`user_id\`), INDEX \`IDX_user_profile_characters_character\` (\`character_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_profile_characters\` ADD CONSTRAINT \`FK_user_profile_characters_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_profile_characters\` ADD CONSTRAINT \`FK_user_profile_characters_character\` FOREIGN KEY (\`character_id\`) REFERENCES \`profile_characters\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE \`users\` ADD \`profile_character_id\` int NULL`);
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD CONSTRAINT \`FK_users_profile_character\` FOREIGN KEY (\`profile_character_id\`) REFERENCES \`profile_characters\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_users_profile_character\` ON \`users\` (\`profile_character_id\`)`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_users_profile_character\` ON \`users\``);
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_users_profile_character\``,
    );
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`profile_character_id\``);
    await queryRunner.query(
      `ALTER TABLE \`user_profile_characters\` DROP FOREIGN KEY \`FK_user_profile_characters_character\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_profile_characters\` DROP FOREIGN KEY \`FK_user_profile_characters_user\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_user_profile_characters_character\` ON \`user_profile_characters\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_user_profile_characters_user\` ON \`user_profile_characters\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_user_profile_characters_user_character_unique\` ON \`user_profile_characters\``,
    );
    await queryRunner.query(`DROP TABLE \`user_profile_characters\``);
    await queryRunner.query(`DROP TABLE \`profile_characters\``);
  }
}
