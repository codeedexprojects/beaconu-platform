import { prisma } from "@beaconu/db";
import { ConflictError, NotFoundError } from "@/shared/errors";
import { PaginationHelper } from "@/shared/responses/pagination";
import { logger } from "@/shared/lib/logger";
import { PushService } from "@/modules/notifications/services/push.service";
import { CourseSwitchRequestRepository } from "../repositories/course-switch-request.repository";
import { ApplicationCourseRepository } from "../repositories/application-course.repository";
import { EnrollmentRepository } from "../repositories/enrollment.repository";
import { EnrollmentService } from "./enrollment.service";
import type { AvailableSwitchCourseItem } from "@beaconu/types";

async function notifyStudentOfReview(
  studentId: string,
  toCourseName: string,
  decision: "approve" | "reject",
): Promise<void> {
  try {
    await PushService.sendToUser(studentId, "student", {
      title:
        decision === "approve"
          ? "Course switch approved"
          : "Course switch rejected",
      body:
        decision === "approve"
          ? `You've been switched to ${toCourseName}. Your Student Hub has been updated.`
          : `Your request to switch to ${toCourseName} was rejected.`,
      data: {
        type:
          decision === "approve"
            ? "course_switch_approved"
            : "course_switch_rejected",
      },
    });
  } catch (error) {
    logger.error(
      { err: error, studentId },
      "Failed to notify student of course switch review",
    );
  }
}
import type {
  RequestCourseSwitchInput,
  ReviewCourseSwitchInput,
} from "../validators/course-switch-request.validator";

function mapRequest(row: {
  id: string;
  studentId: string;
  collegeId: string;
  enrollmentId: string;
  toCourseId: string;
  reason: string;
  supportingDocuments: unknown;
  status: string;
  processedBy: string | null;
  remarks: string | null;
  processedAt: Date | null;
  newEnrollmentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  enrollment: { course: { name: string; code: string } };
  toCourse: { name: string; code: string };
  student?: { fullName: string; email: string | null };
}) {
  return {
    id: row.id,
    studentId: row.studentId,
    studentName: row.student?.fullName ?? null,
    studentEmail: row.student?.email ?? null,
    collegeId: row.collegeId,
    enrollmentId: row.enrollmentId,
    fromCourseName: row.enrollment.course.name,
    fromCourseCode: row.enrollment.course.code,
    toCourseId: row.toCourseId,
    toCourseName: row.toCourse.name,
    toCourseCode: row.toCourse.code,
    reason: row.reason,
    supportingDocUrls: (row.supportingDocuments ?? []) as string[],
    status: row.status,
    processedBy: row.processedBy,
    remarks: row.remarks,
    processedAt: row.processedAt ? row.processedAt.toISOString() : null,
    newEnrollmentId: row.newEnrollmentId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class CourseSwitchRequestService {
  static async listAvailableCourses(
    studentId: string,
  ): Promise<AvailableSwitchCourseItem[]> {
    const activeEnrollment =
      await EnrollmentRepository.findActiveForStudent(studentId);
    if (!activeEnrollment) {
      throw new ConflictError("No active enrollment to switch courses from");
    }

    const rows = await prisma.admissionCycleCourse.findMany({
      where: {
        admissionCycleId: activeEnrollment.admissionCycleId,
        isActive: true,
        courseId: { not: activeEnrollment.courseId },
      },
      select: { course: { select: { id: true, name: true } } },
      orderBy: { course: { name: "asc" } },
    });

    return rows.map((row) => ({ id: row.course.id, name: row.course.name }));
  }

  static async request(studentId: string, data: RequestCourseSwitchInput) {
    const activeEnrollment =
      await EnrollmentRepository.findActiveForStudent(studentId);
    if (!activeEnrollment) {
      throw new ConflictError("No active enrollment to switch courses from");
    }
    if (activeEnrollment.courseId === data.to_course_id) {
      throw new ConflictError("You are already enrolled in this course");
    }

    const enrollment =
      await EnrollmentRepository.findByIdWithApplicationContext(
        activeEnrollment.id,
      );
    if (!enrollment) throw new NotFoundError("Enrollment not found");

    const cycleCourse =
      await ApplicationCourseRepository.findAdmissionCycleCourse(
        enrollment.admissionCycleId,
        data.to_course_id,
      );
    if (!cycleCourse) {
      throw new NotFoundError(
        "This course is not offered under your admission cycle",
      );
    }

    const pending =
      await CourseSwitchRequestRepository.findPendingForEnrollment(
        enrollment.id,
      );
    if (pending) {
      throw new ConflictError(
        "You already have a pending course switch request",
      );
    }

    const created = await CourseSwitchRequestRepository.create({
      studentId,
      collegeId: enrollment.collegeId,
      enrollmentId: enrollment.id,
      toCourseId: data.to_course_id,
      reason: data.reason,
      supportingDocuments: data.supporting_doc_urls ?? [],
    });
    return mapRequest(created);
  }

  static async listMine(studentId: string) {
    const rows = await CourseSwitchRequestRepository.listForStudent(studentId);
    return rows.map(mapRequest);
  }

  static async listForCollege(
    collegeId: string,
    filters: { status?: string },
    pagination: { page: number; limit: number },
  ) {
    const { rows, total } = await CourseSwitchRequestRepository.listForCollege(
      collegeId,
      filters,
      pagination,
    );
    return {
      requests: rows.map(mapRequest),
      meta: PaginationHelper.createMeta(
        total,
        pagination.page,
        pagination.limit,
      ),
    };
  }

  static async countPending(collegeId: string) {
    return CourseSwitchRequestRepository.countPendingForCollege(collegeId);
  }

  static async review(
    collegeId: string,
    staffId: string,
    requestId: string,
    data: ReviewCourseSwitchInput,
  ) {
    const request = await CourseSwitchRequestRepository.findById(requestId);
    if (!request || request.collegeId !== collegeId) {
      throw new NotFoundError("Course switch request not found");
    }
    if (request.status !== "pending") {
      throw new ConflictError(
        `This request has already been ${request.status}`,
      );
    }

    if (data.decision === "reject") {
      const rejected = await CourseSwitchRequestRepository.reject(
        requestId,
        staffId,
        data.remarks ?? null,
      );
      await notifyStudentOfReview(
        request.studentId,
        request.toCourse.name,
        "reject",
      );
      return mapRequest(rejected);
    }

    const oldEnrollment =
      await EnrollmentRepository.findByIdWithApplicationContext(
        request.enrollmentId,
      );
    if (!oldEnrollment) {
      throw new ConflictError("The original enrollment no longer exists");
    }
    if (oldEnrollment.status !== "active") {
      throw new ConflictError(
        "The student's enrollment for this request is no longer active",
      );
    }

    const cycleCourse =
      await ApplicationCourseRepository.findAdmissionCycleCourse(
        oldEnrollment.admissionCycleId,
        request.toCourseId,
      );
    if (!cycleCourse) {
      throw new ConflictError(
        "The target course is no longer offered under this admission cycle",
      );
    }

    const oldCourse = await ApplicationCourseRepository.findByIdWithStatus(
      oldEnrollment.applicationCourseId,
    );

    const applicationId = oldEnrollment.applicationCourse.applicationId;
    const enrollmentNumber = await EnrollmentService.generateEnrollmentNumber(
      oldEnrollment.college.code,
      oldEnrollment.academicYear,
    );

    const approved = await prisma.$transaction(async (tx) => {
      // Find-or-reactivate an ApplicationCourse row for the target course
      // under the SAME application (Enrollment.applicationCourseId is a
      // unique FK, so the target course needs its own dedicated row — it
      // can't reuse the old enrollment's ApplicationCourse row).
      const existingSelection =
        await ApplicationCourseRepository.findExistingSelection(
          applicationId,
          request.toCourseId,
        );

      const newApplicationCourse = existingSelection
        ? await ApplicationCourseRepository.reactivate(
            existingSelection.id,
            {
              applicationFee: cycleCourse.applicationFee.toNumber(),
              courseQuotaSeatId: null,
              preferenceOrder: 1,
            },
            tx,
          )
        : await ApplicationCourseRepository.create(
            {
              applicationId,
              courseId: request.toCourseId,
              applicationFee: cycleCourse.applicationFee.toNumber(),
              courseQuotaSeatId: null,
              isPrimary: true,
              preferenceOrder: 1,
            },
            tx,
          );

      await ApplicationCourseRepository.updateStatus(
        tx,
        newApplicationCourse.id,
        "enrolled",
      );
      await ApplicationCourseRepository.createStatusLog(tx, {
        applicationCourseId: newApplicationCourse.id,
        fromStatus: newApplicationCourse.status,
        toStatus: "enrolled",
        changedByType: "staff_member",
        changedById: staffId,
      });

      const newEnrollment = await EnrollmentRepository.create(tx, {
        studentId: request.studentId,
        collegeId: oldEnrollment.collegeId,
        courseId: request.toCourseId,
        campusId: oldEnrollment.campusId,
        applicationCourseId: newApplicationCourse.id,
        admissionCycleId: oldEnrollment.admissionCycleId,
        academicYear: oldEnrollment.academicYear,
      });
      await EnrollmentRepository.setEnrollmentNumber(
        tx,
        newEnrollment.id,
        enrollmentNumber,
      );

      await EnrollmentRepository.updateStatus(
        tx,
        oldEnrollment.id,
        "course_switched",
      );

      // The old ApplicationCourse's own seat is deferred, not withdrawn or
      // dropped — the student is still enrolled, just on the new course now.
      await ApplicationCourseRepository.updateStatus(
        tx,
        oldEnrollment.applicationCourseId,
        "deferred",
      );
      await ApplicationCourseRepository.createStatusLog(tx, {
        applicationCourseId: oldEnrollment.applicationCourseId,
        fromStatus: oldCourse?.status ?? "enrolled",
        toStatus: "deferred",
        changedByType: "staff_member",
        changedById: staffId,
        remarks: "Seat transferred via course switch request",
      });

      return CourseSwitchRequestRepository.approve(tx, requestId, {
        processedBy: staffId,
        remarks: data.remarks ?? null,
        newEnrollmentId: newEnrollment.id,
      });
    });

    await notifyStudentOfReview(
      request.studentId,
      request.toCourse.name,
      "approve",
    );

    return mapRequest(approved);
  }
}
