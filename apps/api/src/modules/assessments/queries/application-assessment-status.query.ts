import { ApplicationService } from "@/modules/admissions/services/application.service";
import { AttemptRepository } from "../repositories/attempt.repository";
import type { ApplicationAssessmentDetail } from "@beaconu/types";

const NOT_REQUIRED: ApplicationAssessmentDetail = {
  status: "not_required",
  attemptId: null,
  startedAt: null,
  completedAt: null,
  totalScore: null,
  maxScore: null,
  sectionScores: [],
};

const NOT_STARTED: ApplicationAssessmentDetail = {
  ...NOT_REQUIRED,
  status: "not_started",
};

export class ApplicationAssessmentStatusQuery {
  static async getForApplication(
    collegeId: string,
    applicationId: string,
  ): Promise<ApplicationAssessmentDetail> {
    const application =
      await ApplicationService.getForCollegeWithCourseStatuses(
        applicationId,
        collegeId,
      );
    if (!application.assessmentRequired) return NOT_REQUIRED;

    const attempt = await AttemptRepository.findByApplicationForCollege(
      collegeId,
      applicationId,
    );
    if (!attempt) return NOT_STARTED;

    const sectionNameById = new Map(
      attempt.paper.template.templateSections.map((ts) => [
        ts.sectionId,
        ts.section.name,
      ]),
    );
    const rawSectionScores =
      (attempt.sectionScores as Record<
        string,
        { score: number; max: number }
      > | null) ?? {};

    return {
      status: attempt.status as ApplicationAssessmentDetail["status"],
      attemptId: attempt.id,
      startedAt: attempt.startedAt ? attempt.startedAt.toISOString() : null,
      completedAt: attempt.completedAt
        ? attempt.completedAt.toISOString()
        : null,
      totalScore: attempt.totalScore ? Number(attempt.totalScore) : null,
      maxScore: attempt.maxScore ? Number(attempt.maxScore) : null,
      sectionScores: Object.entries(rawSectionScores).map(([sectionId, s]) => ({
        sectionName: sectionNameById.get(sectionId) ?? sectionId,
        score: s.score,
        max: s.max,
      })),
    };
  }
}
