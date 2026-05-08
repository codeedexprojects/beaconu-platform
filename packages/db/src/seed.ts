import 'dotenv/config'
import { prisma } from './index'

async function main(): Promise<void> {
  console.log('Seeding database...')

  // Platform Roles
  const platformRoles = [
    {
      name: 'Super Admin',
      slug: 'super_admin',
      permissions: ['*'],
    },
    {
      name: 'Operations Admin',
      slug: 'operations_admin',
      permissions: ['platform:profiles:view', 'platform:operations:manage'],
    },
    {
      name: 'Lead Manager',
      slug: 'lead_manager',
      permissions: ['platform:profiles:view', 'platform:leads:manage'],
    },
    {
      name: 'Finance Team',
      slug: 'finance_team',
      permissions: ['platform:profiles:view', 'platform:finance:view', 'platform:finance:manage'],
    },
    {
      name: 'Support Team',
      slug: 'support_team',
      permissions: ['platform:profiles:view', 'platform:support:manage'],
    },
    {
      name: 'Content Manager',
      slug: 'content_manager',
      permissions: ['platform:profiles:view', 'platform:content:manage'],
    },
  ]

  for (const role of platformRoles) {
    const upsertedRole = await prisma.platformRole.upsert({
      where: { slug: role.slug },
      update: {
        name: role.name,
        isSystemRole: true,
      },
      create: {
        name: role.name,
        slug: role.slug,
        isSystemRole: true,
      },
    })

    await prisma.platformRolePermission.deleteMany({
      where: { platformRoleId: upsertedRole.id },
    })

    await prisma.platformRolePermission.createMany({
      data: role.permissions.map((permissionCode) => ({
        platformRoleId: upsertedRole.id,
        permissionCode,
      })),
      skipDuplicates: true,
    })
  }

  console.log('Platform roles seeded.')
  
  // Blink Roles
  const blinkRoles = [
    { name: 'Associate Admin', slug: 'associate_admin' },
    { name: 'Associate Employee', slug: 'associate_employee' },
    { name: 'Campus Ambassador', slug: 'campus_ambassador' },
  ]

  for (const role of blinkRoles) {
    await prisma.blinkRole.upsert({
      where: { slug: role.slug },
      update: { name: role.name },
      create: { 
        name: role.name, 
        slug: role.slug,
        isSystemRole: true 
      },
    })
  }

  console.log('Blink roles seeded.')
  console.log('Seed complete.')
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
