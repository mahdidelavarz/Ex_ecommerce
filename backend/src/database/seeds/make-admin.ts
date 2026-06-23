// src/database/seeds/make-admin.ts
//
// Create-or-promote a user to admin by phone number. If the user already
// exists they are promoted; otherwise an active admin account is created
// (handy before the phone has logged in via OTP). Usage:
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
  let user = await userRepository.findOne({ where: { phone_number: phoneNumber } });

  if (!user) {
    user = userRepository.create({
      phone_number: phoneNumber,
      role: UserRole.ADMIN,
      is_active: true,
      profile_completed: true,
    });
    await userRepository.save(user);
    console.log(`✅ Created new admin user ${phoneNumber} (${user.id})`);
  } else {
    user.role = UserRole.ADMIN;
    user.is_active = true;
    await userRepository.save(user);
    console.log(`✅ User ${phoneNumber} (${user.id}) promoted to admin`);
  }

  await AppDataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
