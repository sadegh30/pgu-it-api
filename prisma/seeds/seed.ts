import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const firstName = 'صادق';
  const lastName = 'همت نیا';
  const superuserEmail = 'sadegh.dev30@gmail.com';
  const superuserPhone = '09366672742';
  const plainPassword = '123456';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const superuser = await prisma.user.upsert({
    where: { email: superuserEmail },
    update: {
      firstName,
      lastName,
      passwordHash,
      isActive: true,
      emailVerified: true,
      phoneVerified: true,
    },
    create: {
      email: superuserEmail,
      phone: superuserPhone,
      passwordHash,
      firstName,
      lastName,
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
      phoneVerified: true,
    },
  });

  console.log('superuser created:', {
    id: superuser.id,
    email: superuser.email,
  });

  console.log('user password:', plainPassword);
}

main()
  .catch((e) => {
    console.log('Seeding error.', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Seeding finished.');
  });
