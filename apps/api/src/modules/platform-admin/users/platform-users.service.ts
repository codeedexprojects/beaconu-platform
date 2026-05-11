import { prisma } from '@beaconu/db';
import { ACCOUNT_STATUS } from '@/shared/constants';
import { BLINK_ROLES } from '@/modules/blink/blink.permissions';
import { NotFoundError, ConflictError } from '@/shared/errors';
import { CryptoUtils } from '@/shared/utils';


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

  static async getAllAdmins() {
    const admins = await prisma.platformAdmin.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        platformRole: {
          select: {
            id: true,
            name: true,
            slug: true,
            isSystemRole: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return admins.map((admin) => ({
      id: admin.id,
      fullName: admin.fullName,
      email: admin.email,
      avatarUrl: admin.avatarUrl,
      status: admin.status,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
      role: admin.platformRole
        ? {
            id: admin.platformRole.id,
            name: admin.platformRole.name,
            slug: admin.platformRole.slug,
            isSystemRole: admin.platformRole.isSystemRole,
            isActive: admin.platformRole.isActive,
          }
        : null,
    }));
  }

  static async getAllAssociateAdmins() {
    const users = await prisma.blinkUser.findMany({
      where: {
        blinkRole: {
          slug: BLINK_ROLES.ASSOCIATE_ADMIN,
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        country: true,
        agencyName: true,
        agencyRegNumber: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        blinkRole: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            employees: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      country: user.country,
      agencyName: user.agencyName,
      agencyRegNumber: user.agencyRegNumber,
      status: user.status,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      role: {
        id: user.blinkRole.id,
        name: user.blinkRole.name,
        slug: user.blinkRole.slug,
      },
      employeesCount: user._count.employees,
    }));
  }


  static async updateAssociateAdminStatus(associateAdminId: string, status: string) {
    const user = await prisma.blinkUser.findUnique({
      where: { id: associateAdminId },
      include: {
        blinkRole: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!user || user.blinkRole.slug !== BLINK_ROLES.ASSOCIATE_ADMIN) {
      throw new NotFoundError('Associate admin not found');
    }

    const updated = await prisma.blinkUser.update({
      where: { id: associateAdminId },
      data: { status },
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  static async createAdmin(data: {
    fullName: string;
    email: string;
    password: string;
    platformRoleId: string;
    phoneNumber?: string;
  }) {
    const existing = await prisma.platformAdmin.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictError('Admin with this email already exists');
    }

    const passwordHash = await CryptoUtils.hash(data.password);

    const admin = await prisma.platformAdmin.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash,
        platformRoleId: data.platformRoleId,
        phoneNumber: data.phoneNumber,
        status: ACCOUNT_STATUS.ACTIVE,
      },
      include: {
        platformRole: true,
      },
    });

    return {
      id: admin.id,
      fullName: admin.fullName,
      email: admin.email,
      status: admin.status,
      role: admin.platformRole
        ? {
            id: admin.platformRole.id,
            name: admin.platformRole.name,
            slug: admin.platformRole.slug,
          }
        : null,
    };
  }
}
