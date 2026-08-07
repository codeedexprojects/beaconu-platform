import { Request, Response } from "express";
import { z } from "zod";
import { ApiResponse } from "@/shared/responses/api-response";
import { PaginationHelper } from "@/shared/responses/pagination";
import { ApplicationPaymentService } from "../services/application-payment.service";
import { TokenPaymentService } from "../services/token-payment.service";
import { CommutePaymentService } from "../services/commute-payment.service";
import { HostelPaymentService } from "../services/hostel-payment.service";
import { ApplicationService } from "@/modules/admissions/services/application.service";
import { ApplicationCourseService } from "@/modules/admissions/services/application-course.service";
import { OfferLetterService } from "@/modules/interviews/services/offer-letter.service";
import { confirmPaymentSchema } from "../validators/application-payment.validator";

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
  dietary_preference: z.string().trim().min(1).optional(),
  selected_addons: z.array(selectedAddonSchema).optional(),
});

const confirmHostelBookingSchema = confirmPaymentSchema.extend(
  initiateHostelBookingSchema.shape,
);

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
}
