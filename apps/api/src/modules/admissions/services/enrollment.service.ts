import { prisma } from "@beaconu/db";
import { ConflictError, NotFoundError } from "@/shared/errors";
import { ApplicationCourseRepository } from "../repositories/application-course.repository";
import { EnrollmentRepository } from "../repositories/enrollment.repository";

function randomSuffix(): string {
  return Array.from({ length: 6 }, () =>
    "23456789ABCDEFGHJKLMNPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 33)),
  ).join("");
}

async function generateEnrollmentNumber(
  collegeCode: string,
  academicYear: string,
): Promise<string> {
  const yearDigits = academicYear.replace(/[^0-9]/g, "").slice(0, 4);
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${collegeCode.slice(0, 12)}-${yearDigits}-ENR-${randomSuffix()}`;
    const existing =
      await EnrollmentRepository.findByEnrollmentNumber(candidate);
    if (!existing) return candidate;
  }
  throw new ConflictError(
    "Could not generate a unique enrollment number, retry",
  );
}

function toDto(
  row: NonNullable<
    Awaited<ReturnType<typeof EnrollmentRepository.findByApplicationCourseId>>
  >,
) {
  const { course, ...rest } = row;
  return {
    ...rest,
    courseName: course.name,
    courseCode: course.code,
    enrolledAt: row.enrolledAt.toISOString(),
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export class EnrollmentService {
  static async enroll(
    collegeId: string,
    staffId: string,
    applicationCourseId: string,
  ) {
    const course =
      await ApplicationCourseRepository.findByIdForEnrollment(
        applicationCourseId,
      );
    if (!course || course.application.collegeId !== collegeId) {
      throw new NotFoundError("Application course not found");
    }

    const existing =
      await EnrollmentRepository.findByApplicationCourseId(applicationCourseId);
    if (existing) return toDto(existing);

    if (course.status !== "token_paid") {
      throw new ConflictError(
        "This course's token must be paid before enrolling",
      );
    }

    const enrollmentNumber = await generateEnrollmentNumber(
      course.application.college.code,
      course.application.admissionCycle.admissionYear,
    );

    const created = await prisma.$transaction(async (tx) => {
      if (course.courseQuotaSeatId) {
        const seatLink = await ApplicationCourseRepository.findSeatPoolLink(
          tx,
          course.courseQuotaSeatId,
        );
        const result = seatLink?.seatPoolId
          ? await ApplicationCourseRepository.decrementPoolSeat(
              tx,
              seatLink.seatPoolId,
            )
          : await ApplicationCourseRepository.decrementExclusiveSeat(
              tx,
              course.courseQuotaSeatId,
            );
        if (result.count === 0) {
          throw new ConflictError("No seats available for this quota");
        }
      }

      const enrollment = await EnrollmentRepository.create(tx, {
        studentId: course.application.studentId,
        collegeId: course.application.collegeId,
        courseId: course.courseId,
        campusId: course.application.campusId,
        applicationCourseId,
        admissionCycleId: course.application.admissionCycleId,
        academicYear: course.application.admissionCycle.admissionYear,
      });
      const withNumber = await EnrollmentRepository.setEnrollmentNumber(
        tx,
        enrollment.id,
        enrollmentNumber,
      );

      await ApplicationCourseRepository.updateStatus(
        tx,
        applicationCourseId,
        "enrolled",
      );
      await ApplicationCourseRepository.createStatusLog(tx, {
        applicationCourseId,
        fromStatus: course.status,
        toStatus: "enrolled",
        changedByType: "staff_member",
        changedById: staffId,
      });

      return withNumber;
    });

    return toDto(created);
  }
}
