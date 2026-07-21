import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { NotFoundError } from "@/shared/errors";
import { AdmissionCycleQuery } from "../queries/admission-cycle.query";
import { ApplicationService } from "../services/application.service";
import { ApplicationCourseService } from "../services/application-course.service";
import { ApplicationDocumentService } from "../services/application-document.service";
import { studentAdmissionCycleListQuerySchema } from "../validators/admission-cycle.validator";
import { startApplicationSchema } from "../validators/application.validator";
import { addApplicationCourseSchema } from "../validators/application-course.validator";
import {
  personalDetailsSchema,
  familyDetailsSchema,
  addressDetailsSchema,
  qualificationDetailsSchema,
} from "../validators/application-details.validator";
import { registerApplicationDocumentSchema } from "../validators/application-document.validator";
import { declarationSchema } from "../validators/application-declaration.validator";

export class StudentAdmissionCycleController {
  static async list(req: Request, res: Response) {
    const filters = studentAdmissionCycleListQuerySchema.parse(req.query);
    const result = await AdmissionCycleQuery.listForStudent(filters);
    return res.json(ApiResponse.success("Application forms fetched", result));
  }

  static async getById(req: Request, res: Response) {
    const result = await AdmissionCycleQuery.getByIdForStudent(
      req.params.id as string,
    );
    if (!result) throw new NotFoundError("Application form not found");
    return res.json(ApiResponse.success("Application form fetched", result));
  }
}

export class StudentApplicationController {
  static async start(req: Request, res: Response) {
    const body = startApplicationSchema.parse(req.body);
    const result = await ApplicationService.start(
      req.userId as string,
      req.params.id as string,
      body,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Application started", result));
  }

  static async getMine(req: Request, res: Response) {
    const result = await ApplicationService.getMine(
      req.userId as string,
      req.params.id as string,
    );
    return res.json(ApiResponse.success("Application fetched", result));
  }

  static async listQuotaOptions(req: Request, res: Response) {
    const result = await ApplicationCourseService.listQuotaOptions(
      req.params.id as string,
      req.params.courseId as string,
    );
    return res.json(ApiResponse.success("Quota options fetched", result));
  }

  static async listCourses(req: Request, res: Response) {
    const application = await ApplicationService.getMine(
      req.userId as string,
      req.params.id as string,
    );
    const result = await ApplicationCourseService.list(
      application.id,
      req.userId as string,
    );
    return res.json(ApiResponse.success("Selected courses fetched", result));
  }

  static async addCourse(req: Request, res: Response) {
    const body = addApplicationCourseSchema.parse(req.body);
    const application = await ApplicationService.getMine(
      req.userId as string,
      req.params.id as string,
    );
    const result = await ApplicationCourseService.addCourse(
      application.id,
      req.userId as string,
      body,
    );
    return res.status(201).json(ApiResponse.success("Course added", result));
  }

  static async withdrawCourse(req: Request, res: Response) {
    const application = await ApplicationService.getMine(
      req.userId as string,
      req.params.id as string,
    );
    await ApplicationCourseService.withdrawCourse(
      application.id,
      req.userId as string,
      req.params.appCourseId as string,
    );
    return res.json(ApiResponse.success("Course withdrawn", null));
  }

  static async updatePersonalDetails(req: Request, res: Response) {
    const body = personalDetailsSchema.parse(req.body);
    const application = await ApplicationService.getMine(
      req.userId as string,
      req.params.id as string,
    );
    const result = await ApplicationService.updatePersonalDetails(
      application.id,
      req.userId as string,
      body,
    );
    return res.json(ApiResponse.success("Personal details saved", result));
  }

  static async updateFamilyDetails(req: Request, res: Response) {
    const body = familyDetailsSchema.parse(req.body);
    const application = await ApplicationService.getMine(
      req.userId as string,
      req.params.id as string,
    );
    const result = await ApplicationService.updateFamilyDetails(
      application.id,
      req.userId as string,
      body,
    );
    return res.json(ApiResponse.success("Family details saved", result));
  }

  static async updateAddressDetails(req: Request, res: Response) {
    const body = addressDetailsSchema.parse(req.body);
    const application = await ApplicationService.getMine(
      req.userId as string,
      req.params.id as string,
    );
    const result = await ApplicationService.updateAddressDetails(
      application.id,
      req.userId as string,
      body,
    );
    return res.json(ApiResponse.success("Address details saved", result));
  }

  static async updateQualificationDetails(req: Request, res: Response) {
    const body = qualificationDetailsSchema.parse(req.body);
    const application = await ApplicationService.getMine(
      req.userId as string,
      req.params.id as string,
    );
    const result = await ApplicationService.updateQualificationDetails(
      application.id,
      req.userId as string,
      body,
    );
    return res.json(ApiResponse.success("Qualification details saved", result));
  }

  static async listRequiredDocuments(req: Request, res: Response) {
    const application = await ApplicationService.getMine(
      req.userId as string,
      req.params.id as string,
    );
    const result = await ApplicationDocumentService.listRequired(
      application.id,
      req.userId as string,
    );
    return res.json(ApiResponse.success("Required documents fetched", result));
  }

  static async listUploadedDocuments(req: Request, res: Response) {
    const application = await ApplicationService.getMine(
      req.userId as string,
      req.params.id as string,
    );
    const result = await ApplicationDocumentService.listUploaded(
      application.id,
      req.userId as string,
    );
    return res.json(ApiResponse.success("Uploaded documents fetched", result));
  }

  static async registerDocument(req: Request, res: Response) {
    const body = registerApplicationDocumentSchema.parse(req.body);
    const application = await ApplicationService.getMine(
      req.userId as string,
      req.params.id as string,
    );
    const result = await ApplicationDocumentService.register(
      application.id,
      req.userId as string,
      body,
    );
    return res.status(201).json(ApiResponse.success("Document saved", result));
  }

  static async updateDeclaration(req: Request, res: Response) {
    const body = declarationSchema.parse(req.body);
    const application = await ApplicationService.getMine(
      req.userId as string,
      req.params.id as string,
    );
    const result = await ApplicationService.updateDeclaration(
      application.id,
      req.userId as string,
      body,
    );
    return res.json(ApiResponse.success("Declaration saved", result));
  }

  static async submit(req: Request, res: Response) {
    const application = await ApplicationService.getMine(
      req.userId as string,
      req.params.id as string,
    );
    const result = await ApplicationService.submit(
      application.id,
      req.userId as string,
    );
    return res.json(ApiResponse.success("Application submitted", result));
  }

  static async listMyApplications(req: Request, res: Response) {
    const result = await ApplicationService.listMine(req.userId as string);
    return res.json(ApiResponse.success("Applications fetched", result));
  }

  static async getMyApplicationById(req: Request, res: Response) {
    const result = await ApplicationService.getById(
      req.params.applicationId as string,
      req.userId as string,
    );
    return res.json(ApiResponse.success("Application fetched", result));
  }
}
