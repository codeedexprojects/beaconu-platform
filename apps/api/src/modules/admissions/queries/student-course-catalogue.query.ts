import { prisma } from "@beaconu/db";
import { quotaOptionsForCourse } from "./quota-options.helper";

export class StudentCourseCatalogueQuery {
  /** Course listing for an admission cycle, each with its quota options
   * embedded — one call for the "Add Course" browse/search page instead of
   * a follow-up per-course round trip. Distinct from the payment-summary
   * page, which shows only courses already added to the application. */
  static async listForCycle(admissionCycleId: string, search?: string) {
    const rows = await prisma.admissionCycleCourse.findMany({
      where: {
        admissionCycleId,
        isActive: true,
        ...(search && {
          course: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { code: { contains: search, mode: "insensitive" } },
            ],
          },
        }),
      },
      select: {
        id: true,
        applicationFee: true,
        course: { select: { id: true, name: true, code: true } },
      },
      orderBy: { course: { name: "asc" } },
    });

    return Promise.all(
      rows.map(async (row) => {
        const baseFee = row.applicationFee.toNumber();
        const quotaOptions = await quotaOptionsForCourse(
          row.id,
          row.course.id,
          baseFee,
        );
        return {
          courseId: row.course.id,
          courseName: row.course.name,
          courseCode: row.course.code,
          applicationFee: baseFee.toString(),
          quotaOptions,
        };
      }),
    );
  }
}
