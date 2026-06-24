import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds returns.refund_triggered_at — set when a return transitions to "refunded"
 * (records the moment the refund process was initiated). See M-26.
 */
export class AddRefundTriggeredAt1782345600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "returns" ADD COLUMN IF NOT EXISTS "refund_triggered_at" timestamptz`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "returns" DROP COLUMN IF EXISTS "refund_triggered_at"`,
    );
  }
}
