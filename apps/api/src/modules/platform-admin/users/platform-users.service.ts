import { prisma } from '@beaconu/db';

export class PlatformUsersService {
  static async getAllProfiles() {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        status: true,
        createdAt: true,
      },
    });

    const blinkUsers = await prisma.blinkUser.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        status: true,
        agencyName: true,
        createdAt: true,
      },
    });

    return {
      students,
      blinkUsers,
    };
  }
}
