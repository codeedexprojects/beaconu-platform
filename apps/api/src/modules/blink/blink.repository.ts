import { prisma, BlinkUser } from '@beaconu/db'

export class BlinkRepository {
  static async findByEmail(email: string) {
    return prisma.blinkUser.findUnique({
      where: { email },
      include: { blinkRole: true },
    })
  }

  static async findByAgencyRegNumber(agencyRegNumber: string) {
    return prisma.blinkUser.findUnique({
      where: { agencyRegNumber },
      include: { blinkRole: true },
    })
  }

  static async findById(id: string) {
    return prisma.blinkUser.findUnique({
      where: { id },
      include: { blinkRole: true },
    })
  }

  static async findRoleBySlug(slug: string) {
    return prisma.blinkRole.findUnique({
      where: { slug },
    })
  }

  static async create(data: any) {
    return prisma.blinkUser.create({
      data,
      include: { blinkRole: true },
    })
  }

  static async updateLastLogin(id: string) {
    return prisma.blinkUser.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    })
  }
}
