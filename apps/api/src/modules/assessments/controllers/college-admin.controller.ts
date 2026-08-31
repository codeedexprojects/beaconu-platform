import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { SectionService } from "../services/section.service";
import { QuestionBankService } from "../services/question-bank.service";
import { TemplateService } from "../services/template.service";
import { PaperGenerationService } from "../services/paper-generation.service";
import { SlotService } from "../services/slot.service";
import { EvaluationService } from "../services/evaluation.service";
import { AttemptService } from "../services/attempt.service";
import { QuestionListQuery } from "../queries/question-list.query";
import { TemplateListQuery } from "../queries/template-list.query";
import { PaperPreviewQuery } from "../queries/paper-preview.query";
import { EvaluationDetailQuery } from "../queries/evaluation-detail.query";
import { ApplicationAssessmentStatusQuery } from "../queries/application-assessment-status.query";
import {
  toggleSectionSchema,
  createQuestionSchema,
  updateQuestionSchema,
  questionListQuerySchema,
  createTemplateSchema,
  updateTemplateSchema,
  generatePaperSchema,
  renamePaperSchema,
  createSlotSchema,
  updateSlotSchema,
  toggleSlotSchema,
  scoreOverrideSchema,
  evaluationQueueQuerySchema,
} from "../validators/assessment.validator";

export class CollegeAdminAssessmentController {
  static async listSections(req: Request, res: Response) {
    const result = await SectionService.listSections(req.collegeId!);
    return res.json(ApiResponse.success("Assessment sections fetched", result));
  }

  static async toggleSection(req: Request, res: Response) {
    const data = toggleSectionSchema.parse(req.body);
    const result = await SectionService.toggleSection(
      req.collegeId!,
      req.params.slug as string,
      data.is_active,
    );
    return res.json(ApiResponse.success("Assessment section updated", result));
  }

  static async listQuestionTypes(req: Request, res: Response) {
    const result = await QuestionListQuery.listQuestionTypes(
      req.collegeId!,
      req.params.slug as string,
    );
    return res.json(ApiResponse.success("Question types fetched", result));
  }

  static async listQuestions(req: Request, res: Response) {
    const filters = questionListQuerySchema.parse(req.query);
    const result = await QuestionListQuery.listQuestions(
      req.collegeId!,
      req.params.slug as string,
      filters,
    );
    return res.json(ApiResponse.success("Questions fetched", result));
  }

  static async createQuestion(req: Request, res: Response) {
    const data = createQuestionSchema.parse(req.body);
    const result = await QuestionBankService.create(
      req.collegeId!,
      req.params.slug as string,
      data,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Question created", result));
  }

  static async updateQuestion(req: Request, res: Response) {
    const data = updateQuestionSchema.parse(req.body);
    const result = await QuestionBankService.update(
      req.collegeId!,
      req.params.id as string,
      data,
    );
    return res.json(ApiResponse.success("Question updated", result));
  }

  static async deleteQuestion(req: Request, res: Response) {
    const result = await QuestionBankService.remove(
      req.collegeId!,
      req.params.id as string,
    );
    return res.json(ApiResponse.success("Question deleted", result));
  }

  static async listTemplates(req: Request, res: Response) {
    const result = await TemplateListQuery.listForCollegeAdmin(req.collegeId!);
    return res.json(
      ApiResponse.success("Assessment templates fetched", result),
    );
  }

  static async getTemplate(req: Request, res: Response) {
    const result = await TemplateListQuery.getById(
      req.collegeId!,
      req.params.id as string,
    );
    return res.json(ApiResponse.success("Assessment template fetched", result));
  }

  static async createTemplate(req: Request, res: Response) {
    const data = createTemplateSchema.parse(req.body);
    const result = await TemplateService.create(req.collegeId!, data);
    return res
      .status(201)
      .json(ApiResponse.success("Assessment template created", result));
  }

  static async updateTemplate(req: Request, res: Response) {
    const data = updateTemplateSchema.parse(req.body);
    const result = await TemplateService.update(
      req.collegeId!,
      req.params.id as string,
      data,
    );
    return res.json(ApiResponse.success("Assessment template updated", result));
  }

  static async activateTemplate(req: Request, res: Response) {
    const result = await TemplateService.activate(
      req.collegeId!,
      req.params.id as string,
    );
    return res.json(
      ApiResponse.success("Assessment template activated", result),
    );
  }

  static async archiveTemplate(req: Request, res: Response) {
    const result = await TemplateService.archive(
      req.collegeId!,
      req.params.id as string,
    );
    return res.json(
      ApiResponse.success("Assessment template archived", result),
    );
  }

  static async generatePaper(req: Request, res: Response) {
    const data = generatePaperSchema.parse(req.body);
    const result = await PaperGenerationService.generate(
      req.collegeId!,
      req.userId!,
      req.params.templateId as string,
      data,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Assessment paper generated", result));
  }

  static async listPapers(req: Request, res: Response) {
    const result = await PaperPreviewQuery.listByTemplate(
      req.collegeId!,
      req.params.templateId as string,
    );
    return res.json(ApiResponse.success("Assessment papers fetched", result));
  }

  static async getPaper(req: Request, res: Response) {
    const result = await PaperPreviewQuery.getById(
      req.collegeId!,
      req.params.id as string,
    );
    return res.json(ApiResponse.success("Assessment paper fetched", result));
  }

  static async approvePaper(req: Request, res: Response) {
    const result = await PaperGenerationService.approve(
      req.collegeId!,
      req.userId!,
      req.params.id as string,
    );
    return res.json(ApiResponse.success("Assessment paper approved", result));
  }

  static async renamePaper(req: Request, res: Response) {
    const data = renamePaperSchema.parse(req.body);
    const result = await PaperGenerationService.rename(
      req.collegeId!,
      req.params.id as string,
      data.name,
    );
    return res.json(ApiResponse.success("Assessment paper renamed", result));
  }

  static async deletePaper(req: Request, res: Response) {
    const result = await PaperGenerationService.remove(
      req.collegeId!,
      req.params.id as string,
    );
    return res.json(ApiResponse.success("Assessment paper deleted", result));
  }

  static async listSlots(req: Request, res: Response) {
    const result = await SlotService.listByTemplate(
      req.collegeId!,
      req.params.templateId as string,
    );
    return res.json(ApiResponse.success("Assessment slots fetched", result));
  }

  static async createSlot(req: Request, res: Response) {
    const data = createSlotSchema.parse(req.body);
    const result = await SlotService.create(
      req.collegeId!,
      req.params.templateId as string,
      data,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Assessment slot created", result));
  }

  static async updateSlot(req: Request, res: Response) {
    const data = updateSlotSchema.parse(req.body);
    const result = await SlotService.update(
      req.collegeId!,
      req.params.id as string,
      data,
    );
    return res.json(ApiResponse.success("Assessment slot updated", result));
  }

  static async toggleSlot(req: Request, res: Response) {
    const data = toggleSlotSchema.parse(req.body);
    const result = await SlotService.setActive(
      req.collegeId!,
      req.params.id as string,
      data.is_active,
    );
    return res.json(ApiResponse.success("Assessment slot updated", result));
  }

  static async listEvaluationQueue(req: Request, res: Response) {
    const query = evaluationQueueQuerySchema.parse(req.query);
    const result = await EvaluationService.listQueue(req.collegeId!, {
      status: query.status ? query.status.split(",") : undefined,
    });
    return res.json(ApiResponse.success("Evaluation queue fetched", result));
  }

  static async getEvaluationDetail(req: Request, res: Response) {
    const result = await EvaluationDetailQuery.getById(
      req.collegeId!,
      req.params.attemptId as string,
    );
    return res.json(ApiResponse.success("Attempt detail fetched", result));
  }

  static async scoreAnswer(req: Request, res: Response) {
    const data = scoreOverrideSchema.parse(req.body);
    const result = await EvaluationService.scoreAnswer(
      req.collegeId!,
      req.userId!,
      req.params.id as string,
      data,
    );
    return res.json(ApiResponse.success("Answer scored", result));
  }

  static async publishResult(req: Request, res: Response) {
    const result = await EvaluationService.publish(
      req.collegeId!,
      req.userId!,
      req.params.id as string,
    );
    return res.json(ApiResponse.success("Result published", result));
  }

  static async restartAttempt(req: Request, res: Response) {
    const result = await AttemptService.restart(
      req.collegeId!,
      req.params.id as string,
    );
    return res.json(ApiResponse.success("Attempt restarted", result));
  }

  static async getApplicationAssessmentStatus(req: Request, res: Response) {
    const result = await ApplicationAssessmentStatusQuery.getForApplication(
      req.collegeId!,
      req.params.applicationId as string,
    );
    return res.json(ApiResponse.success("Assessment status fetched", result));
  }
}
