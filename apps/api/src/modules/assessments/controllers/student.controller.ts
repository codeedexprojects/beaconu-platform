import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { AssessmentStartQuery } from "../queries/assessment-start.query";
import { AttemptDetailQuery } from "../queries/attempt-detail.query";
import { AttemptService } from "../services/attempt.service";
import { TrialService } from "../services/trial.service";
import {
  antiCheatEventSchema,
  startAttemptSchema,
  submitAnswerSchema,
  submitTrialSchema,
} from "../validators/assessment.validator";

export class StudentAssessmentController {
  static async getStartInfo(req: Request, res: Response) {
    const result = await AssessmentStartQuery.getBySlotId(
      req.collegeId!,
      req.params.slotId as string,
      req.userId,
      req.query.application_course_id as string | undefined,
    );
    return res.json(
      ApiResponse.success("Assessment start info fetched", result),
    );
  }

  static async getAttemptSections(req: Request, res: Response) {
    const result = await AttemptDetailQuery.getSections(
      req.userId!,
      req.params.id as string,
    );
    return res.json(ApiResponse.success("Sections fetched", result));
  }

  static async getSectionQuestions(req: Request, res: Response) {
    const result = await AttemptDetailQuery.getSectionQuestions(
      req.userId!,
      req.params.id as string,
      req.params.sectionId as string,
    );
    return res.json(ApiResponse.success("Questions fetched", result));
  }

  static async getOverview(req: Request, res: Response) {
    const result = await AttemptDetailQuery.getOverview(
      req.userId!,
      req.params.id as string,
      req.query.section_id as string,
    );
    return res.json(ApiResponse.success("Overview fetched", result));
  }

  static async getTrialPaper(req: Request, res: Response) {
    const result = await TrialService.getTrialPaper(
      req.collegeId!,
      req.params.templateId as string,
    );
    return res.json(ApiResponse.success("Trial paper fetched", result));
  }

  static async submitTrial(req: Request, res: Response) {
    const data = submitTrialSchema.parse(req.body);
    const result = await TrialService.submit(
      req.collegeId!,
      req.params.templateId as string,
      data,
    );
    return res.json(ApiResponse.success("Trial submitted", result));
  }

  static async startAttempt(req: Request, res: Response) {
    const data = startAttemptSchema.parse(req.body);
    const result = await AttemptService.start(
      req.userId!,
      req.collegeId!,
      data,
    );
    return res.status(201).json(ApiResponse.success("Attempt created", result));
  }

  static async beginAttempt(req: Request, res: Response) {
    const result = await AttemptService.beginNow(
      req.userId!,
      req.params.id as string,
    );
    return res.json(ApiResponse.success("Attempt started", result));
  }

  static async saveAnswer(req: Request, res: Response) {
    const data = submitAnswerSchema.parse(req.body);
    const result = await AttemptService.saveAnswer(
      req.userId!,
      req.params.id as string,
      req.params.questionId as string,
      data,
    );
    return res.json(ApiResponse.success("Answer saved", result));
  }

  static async recordAntiCheatEvent(req: Request, res: Response) {
    const data = antiCheatEventSchema.parse(req.body);
    const result = await AttemptService.recordAntiCheatEvent(
      req.userId!,
      req.params.id as string,
      data.type,
    );
    return res.json(ApiResponse.success("Event recorded", result));
  }

  static async submitAttempt(req: Request, res: Response) {
    const result = await AttemptService.submit(
      req.userId!,
      req.params.id as string,
    );
    return res.json(ApiResponse.success("Attempt submitted", result));
  }

  static async getMyAttempt(req: Request, res: Response) {
    const result = await AttemptService.getMine(
      req.userId!,
      req.params.id as string,
    );
    return res.json(ApiResponse.success("Attempt fetched", result));
  }
}
