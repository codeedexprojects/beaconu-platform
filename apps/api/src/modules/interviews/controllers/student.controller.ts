import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { InterviewBookingService } from "../services/interview-booking.service";

export class InterviewStudentController {
  static async getMyBooking(req: Request, res: Response) {
    const result = await InterviewBookingService.getMine(
      req.userId!,
      req.params.applicationId as string,
    );
    return res.json(ApiResponse.success("Interview booking fetched", result));
  }
}
