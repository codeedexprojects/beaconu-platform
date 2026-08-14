import { prisma, Prisma } from "@beaconu/db";
import { PaginationHelper } from "@/shared/responses/pagination";
import type { PendingEnrollmentItem } from "@beaconu/types";
import type { ListPendingEnrollmentQuery } from "../validators/application.validator";

const PENDING_ENROLLMENT_SELECT = {
  id: true,
  courseId: true,
  isPrimary: true,
  applicationFee: true,
  statusUpdatedAt: true,
  course: { select: { name: true, code: true } },
  application: {
    select: {
      id: true,
      applicationNumber: true,
      studentId: true,
      admissionCycleId: true,
      student: { select: { fullName: true, email: true, phoneNumber: true } },
      admissionCycle: { select: { name: true } },
    },
  },
  offerLetter: {
    select: {
      offerNumber: true,
      tokenAmount: true,
      tokenPaymentStatus: true,
    },
  },
} satisfies Prisma.ApplicationCourseSelect;

type PendingEnrollmentRow = Prisma.ApplicationCourseGetPayload<{
  select: typeof PENDING_ENROLLMENT_SELECT;
}>;

function mapRow(row: PendingEnrollmentRow): PendingEnrollmentItem {
  return {
    applicationCourseId: row.id,
    applicationId: row.application.id,
    applicationNumber: row.application.applicationNumber,
    studentId: row.application.studentId,
    studentName: row.application.student.fullName,
    studentEmail: row.application.student.email,
    studentPhone: row.application.student.phoneNumber,
    courseId: row.courseId,
    courseName: row.course.name,
    courseCode: row.course.code,
    isPrimary: row.isPrimary,
    admissionCycleId: row.application.admissionCycleId,
    admissionCycleName: row.application.admissionCycle.name,
    applicationFee: row.applicationFee.toString(),
    offerNumber: row.offerLetter?.offerNumber ?? null,
    tokenAmount: row.offerLetter?.tokenAmount.toString() ?? null,
    tokenPaymentStatus: row.offerLetter?.tokenPaymentStatus ?? null,
    statusUpdatedAt: row.statusUpdatedAt
      ? row.statusUpdatedAt.toISOString()
      : null,
  };
}

export class PendingEnrollmentQuery {
  static async countForCollege(collegeId: string) {
    return prisma.applicationCourse.count({
      where: { status: "token_paid", application: { collegeId } },
    });
  }

  static async listForCollegeAdmin(
    collegeId: string,
    filters: ListPendingEnrollmentQuery,
  ) {
    const where: Prisma.ApplicationCourseWhereInput = {
      status: "token_paid",
      application: {
        collegeId,
        ...(filters.admission_cycle_id && {
          admissionCycleId: filters.admission_cycle_id,
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
      },
    };

    const skip = (filters.page - 1) * filters.limit;
    const [rows, total] = await prisma.$transaction([
      prisma.applicationCourse.findMany({
        where,
        select: PENDING_ENROLLMENT_SELECT,
        orderBy: { statusUpdatedAt: "desc" },
        skip,
        take: filters.limit,
      }),
      prisma.applicationCourse.count({ where }),
    ]);

    return {
      requests: rows.map(mapRow),
      meta: PaginationHelper.createMeta(total, filters.page, filters.limit),
    };
  }
}
