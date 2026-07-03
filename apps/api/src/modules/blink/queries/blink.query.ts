import { prisma } from "@beaconu/db";
import { NotFoundError } from "@/shared/errors";
import type {
  ReferralListItem,
  PaginationMeta,
  EmployeeWithRanking,
  EmployeeListItem,
  ServiceChargeItem,
  AssociateDashboardSummary,
} from "@beaconu/types";
import type {
  ServiceChargeQuery,
  CollegeListQuery,
  UniversityListQuery,
  StreamListQuery,
  EmployeeListQuery,
} from "../validators/blink.validator";

export class BlinkQuery {
  static async getDashboardSummary(
    adminId: string,
    filters: { from?: Date; to?: Date },
  ): Promise<AssociateDashboardSummary> {
    const { from, to } = filters;
    const dateRange =
      from || to
        ? { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) }
        : undefined;

    const rows = await prisma.referral.groupBy({
      by: ["status"],
      where: {
        blinkUser: { associateParentId: adminId },
        ...(dateRange ? { createdAt: dateRange } : {}),
      },
      _count: { _all: true },
    });

    const counts = rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = row._count._all;
      return acc;
    }, {});

    return {
      applicationSubmitted: counts["registered"] ?? 0,
      admissionConfirmed: counts["confirmed"] ?? 0,
      applicationRejected: counts["rejected"] ?? 0,
      droppedOut: counts["dropped_out"] ?? 0,
    };
  }

  static async listReferralsByAdmin(
    adminId: string,
    filters: { status?: string; search?: string; page: number; limit: number },
  ): Promise<{ referrals: ReferralListItem[]; meta: PaginationMeta }> {
    const { status, search, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = {
      blinkUser: { associateParentId: adminId },
      ...(status ? { status } : {}),
      ...(search
        ? {
            student: {
              OR: [
                {
                  fullName: { contains: search, mode: "insensitive" as const },
                },
                { email: { contains: search, mode: "insensitive" as const } },
                {
                  phoneNumber: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            },
          }
        : {}),
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

  static async listReferralsByEmployee(
    employeeId: string,
    filters: { status?: string; search?: string; page: number; limit: number },
  ): Promise<{ referrals: ReferralListItem[]; meta: PaginationMeta }> {
    const { status, search, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = {
      blinkUserId: employeeId,
      ...(status ? { status } : {}),
      ...(search
        ? {
            student: {
              OR: [
                {
                  fullName: { contains: search, mode: "insensitive" as const },
                },
                { email: { contains: search, mode: "insensitive" as const } },
                {
                  phoneNumber: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            },
          }
        : {}),
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
    filters: { from?: Date; to?: Date; page: number; limit: number },
  ): Promise<{ employees: EmployeeWithRanking[]; meta: PaginationMeta }> {
    const { from, to, page, limit } = filters;
    const dateRange =
      from || to
        ? { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) }
        : undefined;

    const employees = await prisma.blinkUser.findMany({
      where: { associateParentId: adminId },
      include: {
        blinkRole: { select: { slug: true } },
        referrals: {
          where: dateRange ? { createdAt: dateRange } : undefined,
          select: { id: true, status: true },
        },
        commissions: {
          where: {
            status: "credited",
            ...(dateRange ? { createdAt: dateRange } : {}),
          },
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

    const ranked = withStats.map((item, idx) => ({
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

    const total = ranked.length;
    const skip = (page - 1) * limit;

    return {
      employees: ranked.slice(skip, skip + limit),
      meta: { total, page, limit, hasNext: skip + limit < total },
    };
  }

  static async listEmployeesPlain(
    adminId: string,
    filters: EmployeeListQuery,
  ): Promise<{
    employees: EmployeeListItem[];
    meta: PaginationMeta & { activeCount: number };
  }> {
    const { status, search, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = {
      associateParentId: adminId,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" as const } },
              { id: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [total, activeCount, rows] = await Promise.all([
      prisma.blinkUser.count({ where }),
      prisma.blinkUser.count({
        where: { associateParentId: adminId, status: "active" },
      }),
      prisma.blinkUser.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { blinkRole: { select: { slug: true } } },
      }),
    ]);

    return {
      employees: rows.map((e) => ({
        id: e.id,
        fullName: e.fullName,
        email: e.email,
        phoneNumber: e.phoneNumber ?? null,
        status: e.status,
        roleSlug: e.blinkRole.slug,
        createdAt: e.createdAt.toISOString(),
      })),
      meta: {
        total,
        page,
        limit,
        hasNext: skip + limit < total,
        activeCount,
      },
    };
  }

  static async listCollegesForEmployee(filters: CollegeListQuery) {
    const { search, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = {
      status: "active",
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { city: { contains: search, mode: "insensitive" as const } },
              { state: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.college.count({ where }),
      prisma.college.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          code: true,
          logoUrl: true,
          city: true,
          state: true,
          university: {
            select: { id: true, name: true, logoUrl: true },
          },
          _count: { select: { courses: { where: { status: "active" } } } },
        },
      }),
    ]);

    return {
      colleges: rows.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        code: c.code,
        logoUrl: c.logoUrl ?? null,
        city: c.city ?? null,
        state: c.state ?? null,
        university: c.university
          ? {
              id: c.university.id,
              name: c.university.name,
              logoUrl: c.university.logoUrl ?? null,
            }
          : null,
        totalCourses: c._count.courses,
      })),
      meta: { total, page, limit, hasNext: skip + limit < total },
    };
  }

  static async listUniversitiesForEmployee(filters: UniversityListQuery) {
    const { search, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = {
      status: "active",
      ...(search
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.university.count({ where }),
      prisma.university.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
        },
      }),
    ]);

    return {
      universities: rows.map((u) => ({
        id: u.id,
        name: u.name,
        slug: u.slug,
        logoUrl: u.logoUrl ?? null,
      })),
      meta: { total, page, limit, hasNext: skip + limit < total },
    };
  }

  /** University basic details + paginated active colleges under it. */
  static async getUniversityDetailForEmployee(
    universityId: string,
    filters: CollegeListQuery,
  ) {
    const university = await prisma.university.findFirst({
      where: { id: universityId, status: "active" },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        state: true,
        city: true,
        accreditation: true,
        universityType: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!university) {
      throw new NotFoundError("University not found");
    }

    const { search, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = {
      universityId,
      status: "active",
      ...(search
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.college.count({ where }),
      prisma.college.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          code: true,
          logoUrl: true,
          city: true,
          state: true,
          _count: { select: { courses: { where: { status: "active" } } } },
        },
      }),
    ]);

    return {
      university: {
        id: university.id,
        name: university.name,
        slug: university.slug,
        logoUrl: university.logoUrl ?? null,
        state: university.state ?? null,
        city: university.city ?? null,
        accreditation: university.accreditation ?? null,
        universityType: university.universityType
          ? {
              id: university.universityType.id,
              name: university.universityType.name,
              slug: university.universityType.slug,
            }
          : null,
      },
      colleges: rows.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        code: c.code,
        logoUrl: c.logoUrl ?? null,
        city: c.city ?? null,
        state: c.state ?? null,
        totalCourses: c._count.courses,
      })),
      meta: { total, page, limit, hasNext: skip + limit < total },
    };
  }

  /** Streams with their active course count — pagination applies to streams only. */
  static async listStreamsWithDisciplinesForEmployee(filters: StreamListQuery) {
    const { search, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(search
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.stream.count({ where }),
      prisma.stream.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
        },
      }),
    ]);

    const courseCounts = await Promise.all(
      rows.map((s) =>
        prisma.course.count({
          where: { status: "active", discipline: { streamId: s.id } },
        }),
      ),
    );

    return {
      streams: rows.map((s, idx) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        logoUrl: s.logoUrl ?? null,
        course_count: courseCounts[idx],
      })),
      meta: { total, page, limit, hasNext: skip + limit < total },
    };
  }

  /** Stream basic details + paginated active disciplines under it. */
  static async getStreamDetailForEmployee(
    streamId: string,
    filters: StreamListQuery,
  ) {
    const stream = await prisma.stream.findFirst({
      where: { id: streamId, isActive: true },
      select: { id: true, name: true, slug: true, logoUrl: true },
    });

    if (!stream) {
      throw new NotFoundError("Stream not found");
    }

    const { search, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = {
      streamId,
      isActive: true,
      ...(search
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.discipline.count({ where }),
      prisma.discipline.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { id: true, name: true, slug: true, logoUrl: true },
      }),
    ]);

    return {
      stream: {
        id: stream.id,
        name: stream.name,
        slug: stream.slug,
        logoUrl: stream.logoUrl ?? null,
      },
      disciplines: rows.map((d) => ({
        id: d.id,
        name: d.name,
        slug: d.slug,
        logoUrl: d.logoUrl ?? null,
      })),
      meta: { total, page, limit, hasNext: skip + limit < total },
    };
  }

  static async listCoursesForEmployee(collegeId: string) {
    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      select: { id: true, name: true },
    });
    if (!college) return null;

    const courses = await prisma.course.findMany({
      where: { collegeId, status: "active" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        duration: true,
        studyMode: true,
        intakeCapacity: true,
        eligibility: true,
        discipline: {
          select: {
            id: true,
            name: true,
            stream: { select: { id: true, name: true } },
          },
        },
        studyLevel: { select: { id: true, name: true } },
        programType: { select: { id: true, name: true } },
      },
    });

    return { college: { id: college.id, name: college.name }, courses };
  }

  static async getCourseDetailForEmployee(collegeId: string, courseId: string) {
    const course = await prisma.course.findFirst({
      where: { id: courseId, collegeId, status: "active" },
      select: {
        id: true,
        name: true,
        code: true,
        duration: true,
        eligibility: true,
        intakeCapacity: true,
        studyMode: true,
        highlights: true,
        curriculum: true,
        careerOpportunities: true,
        eligibilityCriteria: true,
        faqs: true,
        discipline: {
          select: {
            id: true,
            name: true,
            stream: { select: { id: true, name: true } },
          },
        },
        studyLevel: { select: { id: true, name: true } },
        programType: { select: { id: true, name: true } },
        campus: {
          select: { id: true, name: true, city: true, state: true },
        },
        quotas: {
          where: { isActive: true },
          select: {
            id: true,
            tuitionFeeOverride: true,
            collegeQuota: {
              select: { name: true, bucketType: true },
            },
          },
        },
        feeStructures: {
          where: { isActive: true },
          orderBy: [{ academicYear: "desc" }, { feeCategory: "asc" }],
          select: {
            id: true,
            academicYear: true,
            feeCategory: true,
            amount: true,
            yearOrSemester: true,
            instalmentAllowed: true,
            instalmentConfig: true,
            gender: true,
            oneTimeFees: true,
            additionalFees: true,
            whatsIncluded: true,
            whatsExcluded: true,
            feePdfUrl: true,
          },
        },
        serviceChargeConfigs: {
          where: { isActive: true },
          orderBy: { academicYear: "desc" },
          select: {
            id: true,
            academicYear: true,
            studentCategory: true,
            grossAmount: true,
            gstPercentage: true,
            gstAmount: true,
            netPayout: true,
            termsAndConditions: true,
          },
        },
      },
    });

    if (!course) return null;

    return {
      id: course.id,
      name: course.name,
      code: course.code,
      duration: course.duration ?? null,
      eligibility: course.eligibility ?? null,
      intakeCapacity: course.intakeCapacity ?? null,
      studyMode: course.studyMode,
      discipline: course.discipline,
      studyLevel: course.studyLevel,
      programType: course.programType,
      campus: course.campus ?? null,
      highlights: course.highlights,
      curriculum: course.curriculum,
      careerOpportunities: course.careerOpportunities,
      eligibilityCriteria: course.eligibilityCriteria,
      faqs: course.faqs,
      quotas: course.quotas.map((q) => ({
        id: q.id,
        quotaName: q.collegeQuota.name,
        // Seats now live in the shared seat_matrix pool per admission cycle,
        // not on the course-quota config; kept null to preserve DTO shape.
        seats: null as number | null,
        tuitionFeeOverride: q.tuitionFeeOverride
          ? Number(q.tuitionFeeOverride)
          : null,
      })),
      feeStructures: course.feeStructures.map((f) => ({
        id: f.id,
        academicYear: f.academicYear,
        feeCategory: f.feeCategory,
        amount: Number(f.amount),
        yearOrSemester: f.yearOrSemester ?? null,
        instalmentAllowed: f.instalmentAllowed,
        instalmentConfig: f.instalmentConfig,
        gender: f.gender ?? null,
        oneTimeFees: f.oneTimeFees,
        additionalFees: f.additionalFees,
        whatsIncluded: f.whatsIncluded,
        whatsExcluded: f.whatsExcluded,
        feePdfUrl: f.feePdfUrl ?? null,
      })),
      commissions: course.serviceChargeConfigs.map((s) => ({
        id: s.id,
        academicYear: s.academicYear,
        studentCategory: s.studentCategory,
        grossAmount: Number(s.grossAmount),
        gstPercentage: Number(s.gstPercentage),
        gstAmount: Number(s.gstAmount),
        netPayout: Number(s.netPayout),
        termsAndConditions: s.termsAndConditions ?? null,
      })),
    };
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
