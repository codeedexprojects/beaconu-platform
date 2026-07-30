import { prisma, Prisma } from "@beaconu/db";
import type { ApplicationListItem, PaginationMeta } from "@beaconu/types";
import type { ListApplicationsQuery } from "../validators/application.validator";

const APPLICATION_LIST_SELECT = {
  id: true,
  applicationNumber: true,
  studentId: true,
  formStatus: true,
  feePaymentStatus: true,
  totalApplicationFee: true,
  submittedAt: true,
  createdAt: true,
  student: {
    select: { fullName: true, email: true, phoneNumber: true },
  },
  admissionCycle: {
    select: { id: true, name: true },
  },
  applicationCourses: {
    where: { status: { not: "withdrawn" } },
    select: {
      id: true,
      courseId: true,
      isPrimary: true,
      status: true,
      course: { select: { name: true, code: true } },
    },
    orderBy: { preferenceOrder: "asc" as const },
  },
} satisfies Prisma.ApplicationSelect;

type ApplicationListRow = Prisma.ApplicationGetPayload<{
  select: typeof APPLICATION_LIST_SELECT;
}>;

function mapRow(row: ApplicationListRow): ApplicationListItem {
  return {
    id: row.id,
    applicationNumber: row.applicationNumber,
    studentId: row.studentId,
    studentName: row.student.fullName,
    studentEmail: row.student.email,
    studentPhone: row.student.phoneNumber,
    admissionCycleId: row.admissionCycle.id,
    admissionCycleName: row.admissionCycle.name,
    formStatus: row.formStatus,
    feePaymentStatus: row.feePaymentStatus,
    totalApplicationFee: row.totalApplicationFee.toString(),
    courses: row.applicationCourses.map((ac) => ({
      id: ac.id,
      courseId: ac.courseId,
      courseName: ac.course.name,
      courseCode: ac.course.code,
      isPrimary: ac.isPrimary,
      status: ac.status,
    })),
    submittedAt: row.submittedAt ? row.submittedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export class ApplicationListQuery {
  static async listForCollegeAdmin(
    collegeId: string,
    filters: ListApplicationsQuery,
  ) {
    const where: Prisma.ApplicationWhereInput = {
      collegeId,
      ...(filters.admission_cycle_id && {
        admissionCycleId: filters.admission_cycle_id,
      }),
      ...(filters.form_status && { formStatus: filters.form_status }),
      ...(filters.fee_payment_status && {
        feePaymentStatus: filters.fee_payment_status,
      }),
      ...(filters.course_id && {
        applicationCourses: {
          some: {
            courseId: filters.course_id,
            status: { not: "withdrawn" },
          },
        },
      }),
      ...(filters.search && {
        OR: [
          {
            applicationNumber: {
              contains: filters.search,
              mode: "insensitive" as const,
            },
          },
          {
            student: {
              OR: [
                {
                  fullName: {
                    contains: filters.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  email: {
                    contains: filters.search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            },
          },
        ],
      }),
    };

    const skip = (filters.page - 1) * filters.limit;
    const [rows, total] = await prisma.$transaction([
      prisma.application.findMany({
        where,
        select: APPLICATION_LIST_SELECT,
        orderBy: { createdAt: "desc" },
        skip,
        take: filters.limit,
      }),
      prisma.application.count({ where }),
    ]);

    const meta: PaginationMeta = {
      total,
      page: filters.page,
      limit: filters.limit,
      hasNext: skip + rows.length < total,
    };

    return { applications: rows.map(mapRow), meta };
  }
}
