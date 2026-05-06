import 'dotenv/config'
import { prisma } from './index'

async function seed() {
  const roles = [
    { name: 'Associate Admin', slug: 'associate_admin', isSystemRole: true },
    { name: 'Associate', slug: 'associate', isSystemRole: true },
  ]

  for (const role of roles) {
    await prisma.blinkRole.upsert({
      where: { slug: role.slug },
      update: {},
      create: role,
    })
    console.log(`Role ${role.slug} ensured.`)
  }
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
