import { prisma } from "@beaconu/db";
import { BlinkUserCreateData } from "../validators/blink.validator";

export class BlinkRepository {
  static async findByEmail(email: string) {
    return prisma.blinkUser.findUnique({
      where: { email },
      include: { blinkRole: true },
    });
  }

  static async findByRegNumber(regNumber: string) {
    return prisma.blinkUser.findUnique({
      where: { agencyRegNumber: regNumber },
    });
  }

  static async findById(id: string) {
    return prisma.blinkUser.findUnique({
      where: { id },
      include: { blinkRole: true },
    });
  }

  static async create(data: BlinkUserCreateData) {
    return prisma.blinkUser.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash: data.passwordHash,
        phoneNumber: data.phoneNumber,
        country: data.country,
        agencyName: data.agencyName,
        agencyRegNumber: data.agencyRegNumber,
        associateParentId: data.associateParentId,
        collegeId: data.collegeId,
        linkedStudentId: data.linkedStudentId,
        ambassadorType: data.ambassadorType,
        createdByStaffId: data.createdByStaffId,
        blinkRoleId: data.roleId,
        status: data.status,
      },
      include: { blinkRole: true },
    });
  }

  static async updateLastLogin(id: string) {
    return prisma.blinkUser.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  static async findEmployeesByParent(associateParentId: string) {
    return prisma.blinkUser.findMany({
      where: { associateParentId },
      include: { blinkRole: true },
      orderBy: { createdAt: "desc" },
    });
  }

  static async updateStatus(id: string, status: string) {
    return prisma.blinkUser.update({
      where: { id },
      data: { status },
      include: { blinkRole: true },
    });
  }
}
