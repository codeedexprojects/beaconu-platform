import { Request, Response } from "express";
import { z } from "zod";
import { ApiResponse } from "@/shared/responses/api-response";
import { PaginationHelper } from "@/shared/responses/pagination";
import { ApplicationPaymentService } from "../services/application-payment.service";
import { TokenPaymentService } from "../services/token-payment.service";
import { CommutePaymentService } from "../services/commute-payment.service";
import { HostelPaymentService } from "../services/hostel-payment.service";
import { CourseFeePaymentService } from "../services/course-fee-payment.service";
import { CourseFeeSummaryQuery } from "../queries/course-fee-summary.query";
import { ApplicationService } from "@/modules/admissions/services/application.service";
import { ApplicationCourseService } from "@/modules/admissions/services/application-course.service";
import { OfferLetterService } from "@/modules/interviews/services/offer-letter.service";
import { confirmPaymentSchema } from "../validators/application-payment.validator";
import { PaymentReceiptService } from "../services/payment-receipt.service";
import {
  submitOfflineTokenPaymentSchema,
  resubmitOfflineTokenPaymentSchema,
} from "../validators/token-payment.validator";

const initiateCommutePaymentSchema = z.object({
  college_id: z.string().trim().min(1, "college_id is required"),
});

const commutePaymentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const selectedAddonSchema = z.object({
  addon_service_id: z.string().trim().min(1),
  plan_label: z.string().trim().min(1),
});

const initiateHostelBookingSchema = z.object({
  room_type_id: z.string().trim().min(1, "room_type_id is required"),
  room_plan_type: z.enum(["monthly", "annual"]),
  mess_plan_id: z.string().trim().min(1).optional(),
  dietary_preference: z.enum(["vegetarian", "non_vegetarian"]).optional(),
  selected_addons: z.array(selectedAddonSchema).optional(),
});

const confirmHostelBookingSchema = confirmPaymentSchema.extend(
  initiateHostelBookingSchema.shape,
);

const financeCollegeIdQuerySchema = z.object({
  college_id: z.string().trim().min(1, "college_id is required"),
});

const semesterGroupBodySchema = z.object({
  college_id: z.string().trim().min(1, "college_id is required"),
  year_or_semester: z.string().trim().min(1, "year_or_semester is required"),
});

const semesterGroupQuerySchema = z.object({
  college_id: z.string().trim().min(1, "college_id is required"),
  year_or_semester: z.string().trim().min(1, "year_or_semester is required"),
});

export class StudentPaymentController {
  static async initiateApplicationPayment(req: Request, res: Response) {
    const result = await ApplicationPaymentService.initiate(
      req.params.applicationId as string,
      req.userId as string,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Payment order created", result));
  }

  static async confirmApplicationPayment(req: Request, res: Response) {
    const body = confirmPaymentSchema.parse(req.body);
    const result = await ApplicationPaymentService.confirm(
      req.params.applicationId as string,
      req.userId as string,
      body,
    );
    await ApplicationService.markFeePaid(req.params.applicationId as string);
    return res.json(ApiResponse.success("Payment confirmed", result));
  }

  static async initiateTokenPayment(req: Request, res: Response) {
    const result = await TokenPaymentService.initiate(
      req.params.applicationCourseId as string,
      req.userId as string,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Payment order created", result));
  }

  static async confirmTokenPayment(req: Request, res: Response) {
    const body = confirmPaymentSchema.parse(req.body);
    const result = await TokenPaymentService.confirm(
      req.params.applicationCourseId as string,
      req.userId as string,
      body,
    );
    await ApplicationCourseService.markTokenPaid(
      req.params.applicationCourseId as string,
      req.userId as string,
    );
    await OfferLetterService.markTokenPaid(
      req.params.applicationCourseId as string,
      result.id,
    );
    return res.json(ApiResponse.success("Payment confirmed", result));
  }

  static async initiateCommutePayment(req: Request, res: Response) {
    const body = initiateCommutePaymentSchema.parse(req.body);
    const result = await CommutePaymentService.initiate(
      req.userId as string,
      body.college_id,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Payment order created", result));
  }

  static async confirmCommutePayment(req: Request, res: Response) {
    const body = confirmPaymentSchema.parse(req.body);
    const result = await CommutePaymentService.confirm(
      req.userId as string,
      body,
    );
    return res.json(ApiResponse.success("Payment confirmed", result));
  }

  static async listCommutePayments(req: Request, res: Response) {
    const query = commutePaymentsQuerySchema.parse(req.query);
    const result = await CommutePaymentService.listMine(
      req.userId as string,
      query,
    );
    return res.json(
      ApiResponse.success(
        "Commute payments fetched",
        result.data,
        PaginationHelper.createMeta(result.total, query.page, query.limit),
      ),
    );
  }

  static async initiateHostelBooking(req: Request, res: Response) {
    const body = initiateHostelBookingSchema.parse(req.body);
    const result = await HostelPaymentService.initiateBooking(
      req.userId as string,
      body,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Payment order created", result));
  }

  static async confirmHostelBooking(req: Request, res: Response) {
    const body = confirmHostelBookingSchema.parse(req.body);
    const result = await HostelPaymentService.confirmBooking(
      req.userId as string,
      body,
    );
    return res.json(ApiResponse.success("Payment confirmed", result));
  }

  static async listHostelPayments(req: Request, res: Response) {
    const query = commutePaymentsQuerySchema.parse(req.query);
    const result = await HostelPaymentService.listMine(
      req.userId as string,
      query,
    );
    return res.json(
      ApiResponse.success(
        "Hostel payments fetched",
        result.data,
        PaginationHelper.createMeta(result.total, query.page, query.limit),
      ),
    );
  }

  static async getFinanceSummary(req: Request, res: Response) {
    const { college_id } = financeCollegeIdQuerySchema.parse(req.query);
    const result = await CourseFeeSummaryQuery.getSummary(
      req.userId as string,
      college_id,
    );
    return res.json(ApiResponse.success("Finance summary fetched", result));
  }

  static async listCourseFees(req: Request, res: Response) {
    const { college_id } = financeCollegeIdQuerySchema.parse(req.query);
    const result = await CourseFeeSummaryQuery.listCourseFees(
      req.userId as string,
      college_id,
    );
    return res.json(ApiResponse.success("Course fees fetched", result));
  }

  static async initiateFullFeePayment(req: Request, res: Response) {
    const result = await CourseFeePaymentService.initiateFull(
      req.userId as string,
      req.params.feeStructureId as string,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Payment order created", result));
  }

  static async confirmFullFeePayment(req: Request, res: Response) {
    const body = confirmPaymentSchema.parse(req.body);
    const result = await CourseFeePaymentService.confirmFull(
      req.userId as string,
      body,
    );
    return res.json(ApiResponse.success("Payment confirmed", result));
  }

  static async setupInstallmentPlan(req: Request, res: Response) {
    const result = await CourseFeePaymentService.setupInstallmentPlan(
      req.userId as string,
      req.params.feeStructureId as string,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Installment plan created", result));
  }

  static async listInstallments(req: Request, res: Response) {
    const result = await CourseFeePaymentService.listInstallments(
      req.userId as string,
      req.params.feeStructureId as string,
    );
    return res.json(ApiResponse.success("Installments fetched", result));
  }

  static async initiateInstallmentPayment(req: Request, res: Response) {
    const result = await CourseFeePaymentService.initiateInstallment(
      req.userId as string,
      req.params.ledgerEntryId as string,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Payment order created", result));
  }

  static async confirmInstallmentPayment(req: Request, res: Response) {
    const body = confirmPaymentSchema.parse(req.body);
    const result = await CourseFeePaymentService.confirmInstallment(
      req.userId as string,
      body,
    );
    return res.json(ApiResponse.success("Payment confirmed", result));
  }

  static async initiateSemesterFeePayment(req: Request, res: Response) {
    const body = semesterGroupBodySchema.parse(req.body);
    const result = await CourseFeePaymentService.initiateSemesterFull(
      req.userId as string,
      body.college_id,
      body.year_or_semester,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Payment order created", result));
  }

  static async confirmSemesterFeePayment(req: Request, res: Response) {
    const body = confirmPaymentSchema.parse(req.body);
    const result = await CourseFeePaymentService.confirmSemesterFull(
      req.userId as string,
      body,
    );
    return res.json(ApiResponse.success("Payment confirmed", result));
  }

  static async setupSemesterInstallmentPlan(req: Request, res: Response) {
    const body = semesterGroupBodySchema.parse(req.body);
    const result = await CourseFeePaymentService.setupSemesterInstallmentPlan(
      req.userId as string,
      body.college_id,
      body.year_or_semester,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Installment plan created", result));
  }

  static async listSemesterInstallments(req: Request, res: Response) {
    const query = semesterGroupQuerySchema.parse(req.query);
    const result = await CourseFeePaymentService.listSemesterInstallments(
      req.userId as string,
      query.college_id,
      query.year_or_semester,
    );
    return res.json(ApiResponse.success("Installments fetched", result));
  }

  static async listReceipts(req: Request, res: Response) {
    const query = commutePaymentsQuerySchema.parse(req.query);
    const result = await PaymentReceiptService.listMine(
      req.userId as string,
      query,
    );
    return res.json(
      ApiResponse.success("Receipts fetched", result.data, result.meta),
    );
  }

  static async getReceipt(req: Request, res: Response) {
    const result = await PaymentReceiptService.getById(
      req.userId as string,
      req.params.id as string,
    );
    return res.json(ApiResponse.success("Receipt fetched", result));
  }

  static async submitOfflineTokenPayment(req: Request, res: Response) {
    const body = submitOfflineTokenPaymentSchema.parse(req.body);
    const result = await TokenPaymentService.submitOffline(
      req.params.applicationCourseId as string,
      req.userId as string,
      body,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Offline payment submitted", result));
  }

  static async resubmitOfflineTokenPayment(req: Request, res: Response) {
    const body = resubmitOfflineTokenPaymentSchema.parse(req.body);
    const result = await TokenPaymentService.resubmitOffline(
      req.params.transactionId as string,
      req.userId as string,
      body,
    );
    return res.json(ApiResponse.success("Offline payment resubmitted", result));
  }

  static async getOfflineTokenPaymentStatus(req: Request, res: Response) {
    const result = await TokenPaymentService.getOfflineStatus(
      req.params.applicationCourseId as string,
      req.userId as string,
    );
    return res.json(
      ApiResponse.success("Offline payment status fetched", result),
    );
  }
}
