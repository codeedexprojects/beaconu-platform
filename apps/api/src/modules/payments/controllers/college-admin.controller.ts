import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { PaginationHelper } from "@/shared/responses/pagination";
import { TokenPaymentService } from "../services/token-payment.service";
import { ApplicationCourseService } from "@/modules/admissions/services/application-course.service";
import { OfferLetterService } from "@/modules/interviews/services/offer-letter.service";
import { notifyPaymentConfirmed } from "../lib/notify-payment";
import { enqueueInvoiceGeneration } from "../jobs/invoice-generation.job";
import {
  listOfflineReviewQueueQuerySchema,
  reviewOfflineTokenPaymentSchema,
} from "../validators/token-payment.validator";

export class CollegeAdminPaymentController {
  static async listOfflineReviewQueue(req: Request, res: Response) {
    const query = listOfflineReviewQueueQuerySchema.parse(req.query);
    const result = await TokenPaymentService.listOfflineForReview(
      req.collegeId as string,
      {
        verificationStatus: query.status,
        page: query.page,
        limit: query.limit,
      },
    );
    return res.json(
      ApiResponse.success(
        "Offline review queue fetched",
        result.data,
        PaginationHelper.createMeta(result.total, query.page, query.limit),
      ),
    );
  }

  static async reviewOfflineTokenPayment(req: Request, res: Response) {
    const body = reviewOfflineTokenPaymentSchema.parse(req.body);
    const result = await TokenPaymentService.reviewOffline(
      req.params.transactionId as string,
      req.userId as string,
      body,
    );

    if (result.finalized) {
      await ApplicationCourseService.markTokenPaid(
        result.applicationCourseId,
        result.studentId,
      );
      await OfferLetterService.markTokenPaid(
        result.applicationCourseId,
        result.id,
      );
      await notifyPaymentConfirmed(
        result.studentId,
        "token fee",
        Number(result.amount),
      );
      await enqueueInvoiceGeneration(result.id);
    }

    return res.json(ApiResponse.success("Offline payment reviewed", result));
  }
}
