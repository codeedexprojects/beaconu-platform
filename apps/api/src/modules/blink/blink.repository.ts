import { prisma } from '@beaconu/db';
import { CreateBlinkUserData } from './blink.types';

export class BlinkRepository {
  static async findByEmail(email: string) {
    return prisma.blinkUser.findUnique({
      where: { email },
      include: {
        blinkRole: true,
      },
    });
  }

  static async findByRegNumber(regNumber: string) {
    return prisma.blinkUser.findUnique({
      where: { agencyRegNumber: regNumber },
    });
  }

  static async create(data: CreateBlinkUserData) {
    return prisma.blinkUser.create({
      data: {
        fullName: data.agencyName,
        email: data.agencyEmail,
        passwordHash: data.passwordHash,
        phoneCountryCode: '+91',
        phoneNumber: data.agencyPhoneNo,
        country: data.country,
        agencyName: data.agencyName,
        agencyRegNumber: data.agencyRegNumber,
        blinkRoleId: data.roleId,
        status: 'active',
      },
      include: {
        blinkRole: true,
      },
    });
  }

  static async updateLastLogin(id: string) {
    return prisma.blinkUser.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  static async findById(id: string) {
    return prisma.blinkUser.findUnique({
      where: { id },
      include: {
        blinkRole: true,
      },
    });
  }
}
