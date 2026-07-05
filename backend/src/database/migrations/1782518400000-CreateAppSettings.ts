import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the app_settings table used by storefront settings and checkout
 * pricing defaults.
 */
export class CreateAppSettings1782518400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "app_settings" (
        "key"        text        NOT NULL,
        "value"      text        NOT NULL,
        "label"      text        NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_app_settings_key" PRIMARY KEY ("key")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "app_settings"`);
  }
}
