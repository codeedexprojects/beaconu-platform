import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { ApplicationPaymentService } from "../services/application-payment.service";
import { ApplicationService } from "@/modules/admissions/services/application.service";
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
}
