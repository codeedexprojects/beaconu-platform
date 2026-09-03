import { prisma } from "@beaconu/db";
import { ConflictError, NotFoundError } from "@/shared/errors";
import { logger } from "@/shared/lib/logger";
import { PushService } from "@/modules/notifications/services/push.service";
import { BeaconuCardService } from "@/modules/engagement/services/beaconu-card.service";
import { BlinkCommissionService } from "@/modules/blink/services/commission.service";
import { ApplicationCourseRepository } from "../repositories/application-course.repository";
import { EnrollmentRepository } from "../repositories/enrollment.repository";
import { PendingEnrollmentQuery } from "../queries/pending-enrollment.query";

async function notifyStudentOfEnrollment(
  studentId: string,
  courseName: string,
  enrollmentNumber: string,
): Promise<void> {
  try {
    await PushService.sendToUser(studentId, "student", {
      title: "You're enrolled!",
      body: `You've been enrolled in ${courseName} — enrollment #${enrollmentNumber}. Welcome to the Student Hub.`,
      data: { type: "enrollment_confirmed" },
    });
  } catch (error) {
    logger.error(
      { err: error, studentId },
      "Failed to notify student of enrollment",
    );
  }
}

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
  static async hasEnrollmentAtCollege(studentId: string, collegeId: string) {
    return EnrollmentRepository.existsForStudentAtCollege(studentId, collegeId);
  }

  static async countPendingEnrollment(collegeId: string) {
    return PendingEnrollmentQuery.countForCollege(collegeId);
  }

  static async listStudentIdsForCollege(collegeId: string) {
    return EnrollmentRepository.listStudentIdsForCollege(collegeId);
  }

  static async generateEnrollmentNumber(
    collegeCode: string,
    academicYear: string,
  ) {
    return generateEnrollmentNumber(collegeCode, academicYear);
  }

  static async getActiveSummary(studentId: string) {
    const enrollment =
      await EnrollmentRepository.findActiveForStudent(studentId);
    if (!enrollment) return null;
    return {
      collegeId: enrollment.collegeId,
      courseId: enrollment.courseId,
      applicationCourseId: enrollment.applicationCourseId,
      academicYear: enrollment.academicYear,
      collegeName: enrollment.college.name,
      communityLinkUrl: enrollment.college.communityLinkUrl,
      courseName: enrollment.course.name,
      courseDuration: enrollment.course.duration,
    };
  }

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

      await BlinkCommissionService.creditCommissionForEnrollment(
        tx,
        applicationCourseId,
        course.course.referralCommissionAmount,
      );

      await BeaconuCardService.ensureCardForStudent(
        tx,
        course.application.studentId,
        course.application.student.fullName,
      );

      return withNumber;
    });

    await notifyStudentOfEnrollment(
      course.application.studentId,
      course.course.name,
      enrollmentNumber,
    );

    return toDto(created);
  }
}
