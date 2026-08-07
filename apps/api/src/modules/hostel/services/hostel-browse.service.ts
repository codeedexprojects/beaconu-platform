import { ForbiddenError } from "@/shared/errors";
import { EnrollmentService } from "@/modules/admissions/services/enrollment.service";
import { HostelService } from "@/modules/colleges/services/hostel.service";

async function assertEnrolled(studentId: string, collegeId: string) {
  const hasEnrollment = await EnrollmentService.hasEnrollmentAtCollege(
    studentId,
    collegeId,
  );
  if (!hasEnrollment) {
    throw new ForbiddenError("You are not enrolled at this college");
  }
}

export class HostelBrowseService {
  static async listForStudent(studentId: string, collegeId: string) {
    await assertEnrolled(studentId, collegeId);
    return HostelService.getStudentHostelList(collegeId);
  }

  static async getDetailForStudent(
    studentId: string,
    collegeId: string,
    hostelId: string,
  ) {
    await assertEnrolled(studentId, collegeId);
    return HostelService.getStudentHostelDetail(collegeId, hostelId);
  }
}
