import { prisma } from "@beaconu/db";

export class PlatformUsersQuery {
  static async getAllProfiles() {
    const [students, blinkUsers] = await Promise.all([
      prisma.student.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.blinkUser.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          status: true,
          agencyName: true,
          createdAt: true,
          blinkRole: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
      }),
    ]);

    return { students, blinkUsers };
  }

  static async getPendingBlinkUsers() {
    const pendingUsers = await prisma.blinkUser.findMany({
      where: {
        status: "pending_approval",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        status: true,
        agencyName: true,
        createdAt: true,
        blinkRole: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
    });

    return pendingUsers;
  }
}
