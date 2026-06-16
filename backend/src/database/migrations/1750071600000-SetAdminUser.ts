import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetAdminUser1750071600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE users SET role = 'admin' WHERE phone_number = '09025574357'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE users SET role = 'customer' WHERE phone_number = '09025574357'`,
    );
  }
}
