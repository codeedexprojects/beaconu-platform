import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { InterviewBookingService } from "../services/interview-booking.service";
import { InterviewRescheduleService } from "../services/interview-reschedule.service";
import { parseDateOnly } from "../lib/datetime";
import {
  bookInterviewSlotSchema,
  listAvailableSlotsQuerySchema,
  requestInterviewRescheduleSchema,
} from "../validators/interview.validator";

export class InterviewStudentController {
  static async listAvailableSlots(req: Request, res: Response) {
    const query = listAvailableSlotsQuerySchema.parse(req.query);
    const result = await InterviewBookingService.listAvailableSlots(
      query.college_id,
      {
        mode: query.mode,
        scheduledDate: query.scheduled_date
          ? parseDateOnly(query.scheduled_date)
          : undefined,
        dateFrom: query.date_from ? parseDateOnly(query.date_from) : undefined,
        dateTo: query.date_to ? parseDateOnly(query.date_to) : undefined,
        page: query.page,
        limit: query.limit,
      },
    );
    return res.json(
      ApiResponse.success(
        "Available interview slots fetched",
        result.data,
        result.meta,
      ),
    );
  }

  static async bookSlot(req: Request, res: Response) {
    const body = bookInterviewSlotSchema.parse(req.body);
    const result = await InterviewBookingService.bookSlot(req.userId!, body);
    return res
      .status(201)
      .json(ApiResponse.success("Interview booked", result));
  }

  static async getMyBooking(req: Request, res: Response) {
    const result = await InterviewBookingService.getMine(
      req.userId!,
      req.params.applicationId as string,
    );
    return res.json(ApiResponse.success("Interview booking fetched", result));
  }

  static async cancelMyBooking(req: Request, res: Response) {
    const result = await InterviewBookingService.cancelMine(
      req.userId!,
      req.params.id as string,
    );
    return res.json(ApiResponse.success("Interview booking cancelled", result));
  }

  static async requestReschedule(req: Request, res: Response) {
    const body = requestInterviewRescheduleSchema.parse(req.body);
    const result = await InterviewRescheduleService.request(
      req.userId!,
      req.params.id as string,
      body,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Reschedule requested", result));
  }
}
