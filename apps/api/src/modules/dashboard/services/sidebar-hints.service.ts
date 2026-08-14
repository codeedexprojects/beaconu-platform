import { ApplicationService } from "@/modules/admissions/services/application.service";
import { EnrollmentService } from "@/modules/admissions/services/enrollment.service";
import { SeatCancellationService } from "@/modules/admissions/services/seat-cancellation.service";
import { CourseSwitchRequestService } from "@/modules/admissions/services/course-switch-request.service";
import { EvaluationService } from "@/modules/assessments/services/evaluation.service";
import { TicketService } from "@/modules/support/services/ticket.service";
import { DocumentSubmissionRequestService } from "@/modules/documents/services/document-submission-request.service";
import { DocumentRequestService } from "@/modules/documents/services/document-request.service";

export class SidebarHintsService {
  static async getForCollege(collegeId: string) {
    const [
      newApplications,
      assessmentEvaluationQueue,
      pendingEnrollment,
      seatCancellations,
      courseSwitchRequests,
      supportTickets,
      documentSubmissionRequests,
      documentRequests,
    ] = await Promise.all([
      ApplicationService.countNewSubmissions(collegeId),
      EvaluationService.countPendingEvaluation(collegeId),
      EnrollmentService.countPendingEnrollment(collegeId),
      SeatCancellationService.countPending(collegeId),
      CourseSwitchRequestService.countPending(collegeId),
      TicketService.countAwaitingResponse(collegeId),
      DocumentSubmissionRequestService.countUnderReview(collegeId),
      DocumentRequestService.countSubmitted(collegeId),
    ]);

    const otherRequests =
      pendingEnrollment +
      seatCancellations +
      courseSwitchRequests +
      supportTickets +
      documentSubmissionRequests +
      documentRequests;

    return {
      newApplications,
      assessmentEvaluationQueue,
      otherRequests,
      breakdown: {
        pendingEnrollment,
        seatCancellations,
        courseSwitchRequests,
        supportTickets,
        documentSubmissionRequests,
        documentRequests,
      },
    };
  }
}
