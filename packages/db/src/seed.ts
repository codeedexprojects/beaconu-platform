import { prisma } from './index'

async function main(): Promise<void> {
  console.log('Seeding database...')
  // Add seed data here as modules are built
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
