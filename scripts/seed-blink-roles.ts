const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const url = process.env.DATABASE_URL;
  console.log('Using DATABASE_URL:', url);
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url,
      },
    },
  });

  console.log('Seeding Blink System Roles...');

  const roles = [
    {
      name: 'Blink Super Admin',
      slug: 'super_admin',
      isSystemRole: true,
    },
    {
      name: 'Associate Admin',
      slug: 'associate_admin',
      isSystemRole: true,
    },
    {
      name: 'Employee',
      slug: 'employee',
      isSystemRole: true,
    },
  ];

  for (const role of roles) {
    const createdRole = await prisma.blinkRole.upsert({
      where: { slug: role.slug },
      update: {
        name: role.name,
        isSystemRole: role.isSystemRole,
      },
      create: {
        name: role.name,
        slug: role.slug,
        isSystemRole: role.isSystemRole,
      },
    });
    console.log(`- ${createdRole.slug}: ${createdRole.id}`);
  }

  console.log('Blink roles seeded successfully.');
  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
