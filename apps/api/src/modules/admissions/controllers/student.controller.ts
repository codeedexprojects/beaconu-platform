import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { NotFoundError } from "@/shared/errors";
import { AdmissionCycleQuery } from "../queries/admission-cycle.query";
import { StudentCourseCatalogueQuery } from "../queries/student-course-catalogue.query";
import { ApplicationPaymentSummaryQuery } from "../queries/application-payment-summary.query";
import { ApplicationService } from "../services/application.service";
import { ApplicationCourseService } from "../services/application-course.service";
import { ApplicationDocumentService } from "../services/application-document.service";
import { SeatCancellationService } from "../services/seat-cancellation.service";
import { requestSeatCancellationSchema } from "../validators/seat-cancellation.validator";
import { CourseSwitchRequestService } from "../services/course-switch-request.service";
import { requestCourseSwitchSchema } from "../validators/course-switch-request.validator";
import { studentAdmissionCycleListQuerySchema } from "../validators/admission-cycle.validator";
import {
  startApplicationSchema,
  getFormDetailsQuerySchema,
  getStatusAllCyclesQuerySchema,
  getStatusQuerySchema,
} from "../validators/application.validator";
import {
  addApplicationCourseSchema,
  changeApplicationCourseQuotaSchema,
} from "../validators/application-course.validator";
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

  static async listCourseCatalogue(req: Request, res: Response) {
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const result = await StudentCourseCatalogueQuery.listForCycle(
      req.params.id as string,
      search,
    );
    return res.json(ApiResponse.success("Courses fetched", result));
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

  static async listForCycle(req: Request, res: Response) {
    const result = await ApplicationService.listMine(
      req.userId as string,
      req.params.id as string,
    );
    return res.json(ApiResponse.success("Applications fetched", result));
  }

  static async getStatus(req: Request, res: Response) {
    const query = getStatusQuerySchema.parse(req.query);
    const result = await ApplicationService.getStatus(
      req.userId as string,
      req.params.id as string,
      query.application_id,
    );
    return res.json(ApiResponse.success("Application status fetched", result));
  }

  static async getStatusAllCycles(req: Request, res: Response) {
    const query = getStatusAllCyclesQuerySchema.parse(req.query);
    const result = await ApplicationService.getStatusAllCycles(
      req.userId as string,
      query.college_id,
    );
    return res.json(ApiResponse.success("Application status fetched", result));
  }

  static async getFormDetails(req: Request, res: Response) {
    const query = getFormDetailsQuerySchema.parse(req.query);
    const result = await ApplicationService.getFormDetails(
      req.params.applicationId as string,
      req.userId as string,
      query.section,
    );
    return res.json(ApiResponse.success("Form details fetched", result));
  }

  static async addCourse(req: Request, res: Response) {
    const body = addApplicationCourseSchema.parse(req.body);
    const result = await ApplicationCourseService.addCourse(
      req.params.applicationId as string,
      req.userId as string,
      body,
    );
    return res.status(201).json(ApiResponse.success("Course added", result));
  }

  static async withdrawCourse(req: Request, res: Response) {
    await ApplicationCourseService.withdrawCourse(
      req.params.applicationId as string,
      req.userId as string,
      req.params.appCourseId as string,
    );
    return res.json(ApiResponse.success("Course withdrawn", null));
  }

  static async changeCourseQuota(req: Request, res: Response) {
    const body = changeApplicationCourseQuotaSchema.parse(req.body);
    const result = await ApplicationCourseService.changeQuota(
      req.params.applicationId as string,
      req.userId as string,
      req.params.appCourseId as string,
      body.course_quota_seat_id ?? null,
    );
    return res.json(ApiResponse.success("Quota updated", result));
  }

  static async getPaymentSummary(req: Request, res: Response) {
    await ApplicationService.getById(
      req.params.applicationId as string,
      req.userId as string,
    );
    const result = await ApplicationPaymentSummaryQuery.getForApplication(
      req.params.applicationId as string,
    );
    return res.json(ApiResponse.success("Payment summary fetched", result));
  }

  static async updatePersonalDetails(req: Request, res: Response) {
    const body = personalDetailsSchema.parse(req.body);
    const result = await ApplicationService.updatePersonalDetails(
      req.params.applicationId as string,
      req.userId as string,
      body,
    );
    return res.json(ApiResponse.success("Personal details saved", result));
  }

  static async updateFamilyDetails(req: Request, res: Response) {
    const body = familyDetailsSchema.parse(req.body);
    const result = await ApplicationService.updateFamilyDetails(
      req.params.applicationId as string,
      req.userId as string,
      body,
    );
    return res.json(ApiResponse.success("Family details saved", result));
  }

  static async updateAddressDetails(req: Request, res: Response) {
    const body = addressDetailsSchema.parse(req.body);
    const result = await ApplicationService.updateAddressDetails(
      req.params.applicationId as string,
      req.userId as string,
      body,
    );
    return res.json(ApiResponse.success("Address details saved", result));
  }

  static async updateQualificationDetails(req: Request, res: Response) {
    const body = qualificationDetailsSchema.parse(req.body);
    const result = await ApplicationService.updateQualificationDetails(
      req.params.applicationId as string,
      req.userId as string,
      body,
    );
    return res.json(ApiResponse.success("Qualification details saved", result));
  }

  static async listRequiredDocuments(req: Request, res: Response) {
    const result = await ApplicationDocumentService.listRequired(
      req.params.applicationId as string,
      req.userId as string,
    );
    return res.json(ApiResponse.success("Required documents fetched", result));
  }

  static async listUploadedDocuments(req: Request, res: Response) {
    const result = await ApplicationDocumentService.listUploaded(
      req.params.applicationId as string,
      req.userId as string,
    );
    return res.json(ApiResponse.success("Uploaded documents fetched", result));
  }

  static async registerDocument(req: Request, res: Response) {
    const body = registerApplicationDocumentSchema.parse(req.body);
    const result = await ApplicationDocumentService.register(
      req.params.applicationId as string,
      req.userId as string,
      body,
    );
    return res.status(201).json(ApiResponse.success("Document saved", result));
  }

  static async updateDeclaration(req: Request, res: Response) {
    const body = declarationSchema.parse(req.body);
    const result = await ApplicationService.updateDeclaration(
      req.params.applicationId as string,
      req.userId as string,
      body,
    );
    return res.json(ApiResponse.success("Declaration saved", result));
  }

  static async submit(req: Request, res: Response) {
    const result = await ApplicationService.submit(
      req.params.applicationId as string,
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

  static async requestSeatCancellation(req: Request, res: Response) {
    const body = requestSeatCancellationSchema.parse(req.body);
    const result = await SeatCancellationService.request(
      req.userId as string,
      body,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Cancellation request submitted", result));
  }

  static async listMySeatCancellations(req: Request, res: Response) {
    const result = await SeatCancellationService.listMine(req.userId as string);
    return res.json(
      ApiResponse.success("Cancellation requests fetched", result),
    );
  }

  static async requestCourseSwitch(req: Request, res: Response) {
    const body = requestCourseSwitchSchema.parse(req.body);
    const result = await CourseSwitchRequestService.request(
      req.userId as string,
      body,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Course switch request submitted", result));
  }

  static async listMyCourseSwitchRequests(req: Request, res: Response) {
    const result = await CourseSwitchRequestService.listMine(
      req.userId as string,
    );
    return res.json(
      ApiResponse.success("Course switch requests fetched", result),
    );
  }
}
