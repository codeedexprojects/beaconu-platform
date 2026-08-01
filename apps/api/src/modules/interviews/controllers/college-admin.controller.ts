import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { InterviewSlotService } from "../services/interview-slot.service";
import { InterviewBookingService } from "../services/interview-booking.service";
import { InterviewRescheduleService } from "../services/interview-reschedule.service";
import { InterviewSettingsService } from "../services/interview-settings.service";
import { ApplicationCourseService } from "@/modules/admissions/services/application-course.service";
import { parseDateOnly, parseTimeOnly } from "../lib/datetime";
import {
  createInterviewSlotSchema,
  updateInterviewSlotSchema,
  listInterviewSlotsQuerySchema,
  completeInterviewSchema,
  listInterviewBookingsQuerySchema,
  reviewInterviewRescheduleSchema,
  listInterviewReschedulesQuerySchema,
  updateInterviewSettingsSchema,
} from "../validators/interview.validator";

export class InterviewCollegeAdminController {
  static async createSlot(req: Request, res: Response) {
    const body = createInterviewSlotSchema.parse(req.body);
    const result = await InterviewSlotService.create(req.collegeId!, {
      mode: body.mode,
      scheduledDate: parseDateOnly(body.scheduled_date),
      startTime: parseTimeOnly(body.start_time),
      endTime: parseTimeOnly(body.end_time),
      durationMins: body.duration_mins,
      campusId: body.campus_id,
      venue: body.venue,
      interviewerId: body.interviewer_id,
    });
    return res
      .status(201)
      .json(ApiResponse.success("Interview slot created", result));
  }

  static async listSlots(req: Request, res: Response) {
    const query = listInterviewSlotsQuerySchema.parse(req.query);
    const result = await InterviewSlotService.list(req.collegeId!, query);
    return res.json(ApiResponse.success("Interview slots fetched", result));
  }

  static async updateSlot(req: Request, res: Response) {
    const body = updateInterviewSlotSchema.parse(req.body);
    const result = await InterviewSlotService.update(
      req.collegeId!,
      req.params.id as string,
      {
        ...(body.mode !== undefined && { mode: body.mode }),
        ...(body.scheduled_date !== undefined && {
          scheduledDate: parseDateOnly(body.scheduled_date),
        }),
        ...(body.start_time !== undefined && {
          startTime: parseTimeOnly(body.start_time),
        }),
        ...(body.end_time !== undefined && {
          endTime: parseTimeOnly(body.end_time),
        }),
        ...(body.duration_mins !== undefined && {
          durationMins: body.duration_mins,
        }),
        ...(body.campus_id !== undefined && { campusId: body.campus_id }),
        ...(body.venue !== undefined && { venue: body.venue }),
        ...(body.interviewer_id !== undefined && {
          interviewerId: body.interviewer_id,
        }),
      },
    );
    return res.json(ApiResponse.success("Interview slot updated", result));
  }

  static async cancelSlot(req: Request, res: Response) {
    const result = await InterviewSlotService.cancel(
      req.collegeId!,
      req.params.id as string,
    );
    return res.json(ApiResponse.success("Interview slot cancelled", result));
  }

  static async listBookings(req: Request, res: Response) {
    const query = listInterviewBookingsQuerySchema.parse(req.query);
    const result = await InterviewBookingService.listForCollege(
      req.collegeId!,
      query.status,
    );
    return res.json(ApiResponse.success("Interview bookings fetched", result));
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

  static async listReschedules(req: Request, res: Response) {
    const query = listInterviewReschedulesQuerySchema.parse(req.query);
    const result = await InterviewRescheduleService.listForCollege(
      req.collegeId!,
      query.status,
    );
    return res.json(
      ApiResponse.success("Interview reschedule requests fetched", result),
    );
  }

  static async reviewReschedule(req: Request, res: Response) {
    const body = reviewInterviewRescheduleSchema.parse(req.body);
    const result = await InterviewRescheduleService.review(
      req.collegeId!,
      req.userId!,
      req.params.id as string,
      body,
    );
    return res.json(ApiResponse.success("Reschedule request reviewed", result));
  }

  static async getSettings(req: Request, res: Response) {
    const result = await InterviewSettingsService.get(req.collegeId!);
    return res.json(ApiResponse.success("Interview settings fetched", result));
  }

  static async updateSettings(req: Request, res: Response) {
    const body = updateInterviewSettingsSchema.parse(req.body);
    const result = await InterviewSettingsService.update(req.collegeId!, {
      ...(body.allow_gmeet !== undefined && { allowGmeet: body.allow_gmeet }),
      ...(body.allow_on_campus !== undefined && {
        allowOnCampus: body.allow_on_campus,
      }),
      ...(body.gmeet !== undefined && { gmeet: body.gmeet }),
      ...(body.on_campus !== undefined && { onCampus: body.on_campus }),
    });
    return res.json(ApiResponse.success("Interview settings updated", result));
  }

  static async shortlist(req: Request, res: Response) {
    await ApplicationCourseService.markShortlisted(
      req.params.applicationCourseId as string,
      req.userId!,
    );
    return res.json(
      ApiResponse.success("Application course shortlisted", null),
    );
  }
}
