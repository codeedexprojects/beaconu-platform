import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { ApplicationPaymentService } from "../services/application-payment.service";
import { TokenPaymentService } from "../services/token-payment.service";
import { ApplicationService } from "@/modules/admissions/services/application.service";
import { ApplicationCourseService } from "@/modules/admissions/services/application-course.service";
import { OfferLetterService } from "@/modules/interviews/services/offer-letter.service";
import { confirmPaymentSchema } from "../validators/application-payment.validator";

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
}
