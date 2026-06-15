// src/database/seeds/make-admin.ts
//
// One-off script to promote a user to admin. Usage:
//   npx ts-node src/database/seeds/make-admin.ts 09123456789
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../entities/user.entity';

async function main() {
  const phoneNumber = process.argv[2];

  if (!phoneNumber) {
    console.error('Usage: ts-node src/database/seeds/make-admin.ts <phone_number>');
    process.exit(1);
  }

  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { phone_number: phoneNumber } });

  if (!user) {
    console.error(`No user found with phone number ${phoneNumber}`);
    await AppDataSource.destroy();
    process.exit(1);
  }

  user.role = UserRole.ADMIN;
  await userRepository.save(user);

  console.log(`✅ User ${phoneNumber} (${user.id}) promoted to admin`);
  await AppDataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
