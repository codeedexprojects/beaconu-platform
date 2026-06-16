import { prisma } from "@beaconu/db";
import type {
  ReferralListItem,
  PaginationMeta,
  EmployeeWithRanking,
  ServiceChargeItem,
} from "@beaconu/types";
import type { ServiceChargeQuery } from "../validators/blink.validator";

export class BlinkQuery {
  static async listReferralsByAdmin(
    adminId: string,
    filters: { status?: string; page: number; limit: number },
  ): Promise<{ referrals: ReferralListItem[]; meta: PaginationMeta }> {
    const { status, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = {
      blinkUser: { associateParentId: adminId },
      ...(status ? { status } : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.referral.count({ where }),
      prisma.referral.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              avatarUrl: true,
            },
          },
          blinkUser: {
            select: { id: true, fullName: true, email: true },
          },
          referralCode: {
            include: {
              college: { select: { id: true, name: true } },
              course: { select: { id: true, name: true } },
            },
          },
          commission: {
            select: { id: true, netPayout: true, status: true },
          },
        },
      }),
    ]);

    return {
      referrals: rows.map((r) => ({
        id: r.id,
        student: {
          id: r.student.id,
          fullName: r.student.fullName,
          email: r.student.email ?? null,
          phoneNumber: r.student.phoneNumber ?? null,
          avatarUrl: r.student.avatarUrl ?? null,
        },
        employee: {
          id: r.blinkUser.id,
          fullName: r.blinkUser.fullName,
          email: r.blinkUser.email,
        },
        college: {
          id: r.referralCode.college.id,
          name: r.referralCode.college.name,
        },
        course: r.referralCode.course
          ? {
              id: r.referralCode.course.id,
              name: r.referralCode.course.name,
            }
          : null,
        status: r.status,
        commission: r.commission
          ? {
              id: r.commission.id,
              netPayout: Number(r.commission.netPayout),
              status: r.commission.status,
            }
          : null,
        createdAt: r.createdAt.toISOString(),
        statusUpdatedAt: r.statusUpdatedAt?.toISOString() ?? null,
      })),
      meta: {
        total,
        page,
        limit,
        hasNext: skip + limit < total,
      },
    };
  }

  static async listEmployeesWithRankings(
    adminId: string,
  ): Promise<EmployeeWithRanking[]> {
    const employees = await prisma.blinkUser.findMany({
      where: { associateParentId: adminId },
      include: {
        blinkRole: { select: { slug: true } },
        referrals: { select: { id: true, status: true } },
        commissions: {
          where: { status: "credited" },
          select: { netPayout: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const withStats = employees.map((e) => ({
      employee: e,
      confirmedCount: e.referrals.filter((r) => r.status === "confirmed")
        .length,
      totalReferrals: e.referrals.length,
      commissionEarned: e.commissions.reduce(
        (sum, c) => sum + Number(c.netPayout),
        0,
      ),
    }));

    withStats.sort((a, b) => b.confirmedCount - a.confirmedCount);

    return withStats.map((item, idx) => ({
      id: item.employee.id,
      fullName: item.employee.fullName,
      email: item.employee.email,
      phoneNumber: item.employee.phoneNumber ?? null,
      status: item.employee.status,
      roleSlug: item.employee.blinkRole.slug,
      createdAt: item.employee.createdAt.toISOString(),
      rank: idx + 1,
      totalReferrals: item.totalReferrals,
      confirmedCount: item.confirmedCount,
      commissionEarned: item.commissionEarned,
    }));
  }

  static async listServiceCharges(
    filters: ServiceChargeQuery,
  ): Promise<ServiceChargeItem[]> {
    const where = {
      ...(filters.isActive !== undefined
        ? { isActive: filters.isActive }
        : { isActive: true }),
      ...(filters.collegeId ? { collegeId: filters.collegeId } : {}),
      ...(filters.courseId ? { courseId: filters.courseId } : {}),
      ...(filters.academicYear ? { academicYear: filters.academicYear } : {}),
    };

    const rows = await prisma.serviceChargeConfig.findMany({
      where,
      include: {
        college: { select: { id: true, name: true } },
        course: { select: { id: true, name: true } },
      },
      orderBy: [{ collegeId: "asc" }, { academicYear: "desc" }],
    });

    return rows.map((r) => ({
      id: r.id,
      college: { id: r.college.id, name: r.college.name },
      course: r.course ? { id: r.course.id, name: r.course.name } : null,
      academicYear: r.academicYear,
      studentCategory: r.studentCategory,
      grossAmount: Number(r.grossAmount),
      gstPercentage: Number(r.gstPercentage),
      gstAmount: Number(r.gstAmount),
      netPayout: Number(r.netPayout),
      termsAndConditions: r.termsAndConditions ?? null,
      isActive: r.isActive,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }
}
