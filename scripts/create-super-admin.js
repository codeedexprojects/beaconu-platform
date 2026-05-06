const { PrismaClient } = require('./packages/db/generated/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'superadmin@beaconu.com';
  const password = 'password@123';
  const fullName = 'Platform Super Admin';

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.platformAdmin.upsert({
    where: { email },
    update: {
      passwordHash,
      fullName,
      status: 'active',
    },
    create: {
      email,
      passwordHash,
      fullName,
      status: 'active',
    },
  });

  console.log('Super-admin created/updated:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
