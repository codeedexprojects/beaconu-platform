import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { AssessmentStartQuery } from "../queries/assessment-start.query";
import { AttemptDetailQuery } from "../queries/attempt-detail.query";
import { AttemptService } from "../services/attempt.service";
import { TrialService } from "../services/trial.service";
import {
  antiCheatEventSchema,
  getStartInfoQuerySchema,
  sectionQuestionQuerySchema,
  startAttemptSchema,
  submitAnswerSchema,
} from "../validators/assessment.validator";

export class StudentAssessmentController {
  static async getStartInfo(req: Request, res: Response) {
    const { application_id } = getStartInfoQuerySchema.parse(req.query);
    const result = await AssessmentStartQuery.getForApplication(
      req.userId!,
      application_id,
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
    const { question_order } = sectionQuestionQuerySchema.parse(req.query);
    const result = await AttemptDetailQuery.getSectionQuestions(
      req.userId!,
      req.params.id as string,
      req.params.sectionId as string,
      question_order,
    );
    return res.json(ApiResponse.success("Question fetched", result));
  }

  static async getOverview(req: Request, res: Response) {
    const result = await AttemptDetailQuery.getOverview(
      req.userId!,
      req.params.id as string,
      req.query.section_id as string,
    );
    return res.json(ApiResponse.success("Overview fetched", result));
  }

  static async getTrialSections(req: Request, res: Response) {
    const result = await TrialService.getSections(
      req.params.templateId as string,
    );
    return res.json(ApiResponse.success("Trial sections fetched", result));
  }

  static async getTrialSectionQuestions(req: Request, res: Response) {
    const { question_order } = sectionQuestionQuerySchema.parse(req.query);
    const result = await TrialService.getSectionQuestions(
      req.params.templateId as string,
      req.params.sectionId as string,
      question_order,
    );
    return res.json(ApiResponse.success("Trial question fetched", result));
  }

  static async startAttempt(req: Request, res: Response) {
    const data = startAttemptSchema.parse(req.body);
    const result = await AttemptService.start(req.userId!, data);
    return res.status(201).json(ApiResponse.success("Attempt started", result));
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
