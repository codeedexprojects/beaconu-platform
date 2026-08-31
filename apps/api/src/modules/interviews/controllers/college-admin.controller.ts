import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { InterviewBookingService } from "../services/interview-booking.service";
import { OfferLetterService } from "../services/offer-letter.service";
import { parseDateOnly } from "../lib/datetime";
import {
  scheduleInterviewSchema,
  completeInterviewSchema,
  listInterviewBookingsQuerySchema,
  panelAvailabilityQuerySchema,
  shortlistCourseSchema,
} from "../validators/interview.validator";

export class InterviewCollegeAdminController {
  static async listBookings(req: Request, res: Response) {
    const query = listInterviewBookingsQuerySchema.parse(req.query);
    const result =
      query.status === "pending"
        ? await InterviewBookingService.listPending(req.collegeId!, {
            search: query.search,
          })
        : await InterviewBookingService.listForCollege(req.collegeId!, query);
    return res.json(ApiResponse.success("Interview bookings fetched", result));
  }

  static async getBooking(req: Request, res: Response) {
    const result = await InterviewBookingService.getBooking(
      req.collegeId!,
      req.params.id as string,
    );
    return res.json(ApiResponse.success("Interview booking fetched", result));
  }

  static async getApplicationDetail(req: Request, res: Response) {
    const result = await InterviewBookingService.getApplicationDetail(
      req.collegeId!,
      req.params.applicationId as string,
    );
    return res.json(ApiResponse.success("Interview candidate fetched", result));
  }

  static async getPanelAvailability(req: Request, res: Response) {
    const query = panelAvailabilityQuerySchema.parse(req.query);
    const result = await InterviewBookingService.getPanelAvailability(
      req.collegeId!,
      query,
    );
    return res.json(ApiResponse.success("Panel availability fetched", result));
  }

  static async schedule(req: Request, res: Response) {
    const body = scheduleInterviewSchema.parse(req.body);
    const result = await InterviewBookingService.schedule(
      req.collegeId!,
      req.userId!,
      req.params.applicationId as string,
      body,
    );
    return res.json(ApiResponse.success("Interview scheduled", result));
  }

  static async completeInterview(req: Request, res: Response) {
    const body = completeInterviewSchema.parse(req.body);
    const result = await InterviewBookingService.completeInterview(
      req.collegeId!,
      req.userId!,
      req.params.id as string,
      body,
    );
    return res.json(ApiResponse.success("Interview marked completed", result));
  }

  static async cancel(req: Request, res: Response) {
    const result = await InterviewBookingService.cancel(
      req.collegeId!,
      req.params.id as string,
    );
    return res.json(ApiResponse.success("Interview cancelled", result));
  }

  static async shortlist(req: Request, res: Response) {
    const body = shortlistCourseSchema.parse(req.body);
    const result = await OfferLetterService.issueForShortlist(
      req.collegeId!,
      req.userId!,
      req.params.applicationCourseId as string,
      {
        documentUrl: body.document_url,
        validUntil: parseDateOnly(body.valid_until),
      },
    );
    return res.json(
      ApiResponse.success("Application course shortlisted", result),
    );
  }
}
