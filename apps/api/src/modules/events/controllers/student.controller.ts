import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { EventService } from "../services/event.service";
import {
  ListMyRecordingsQueryInput,
  ListMyRegistrationsQueryInput,
  ListUpcomingEventsQueryInput,
} from "../validators/event.validator";

export class EventStudentController {
  static async listUpcoming(req: Request, res: Response) {
    const query = req.query as unknown as ListUpcomingEventsQueryInput;

    const { events, meta } = await EventService.listUpcoming(
      req.userId!,
      query.page,
      query.limit,
      {
        category: query.category,
        eventMode: query.event_mode,
        isFree: query.is_free,
        search: query.search,
      },
    );
    return res
      .status(200)
      .json(ApiResponse.success("Upcoming events retrieved", events, meta));
  }

  static async getBySlug(req: Request, res: Response) {
    const event = await EventService.getBySlug(
      req.params["slug"] as string,
      req.userId!,
    );
    return res.status(200).json(ApiResponse.success("Event retrieved", event));
  }

  static async getById(req: Request, res: Response) {
    const event = await EventService.getPublicById(
      req.params["id"] as string,
      req.userId!,
    );
    return res.status(200).json(ApiResponse.success("Event retrieved", event));
  }

  static async register(req: Request, res: Response) {
    const registration = await EventService.register(
      req.params["id"] as string,
      req.userId!,
      req.body,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Registered for event", registration));
  }

  static async cancelRegistration(req: Request, res: Response) {
    const registration = await EventService.cancelRegistration(
      req.params["id"] as string,
      req.userId!,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Registration cancelled", registration));
  }

  static async listMyRegistrations(req: Request, res: Response) {
    const query = req.query as unknown as ListMyRegistrationsQueryInput;

    const { registrations, meta } = await EventService.listMyRegistrations(
      req.userId!,
      query.page,
      query.limit,
      query.status,
      query.search,
    );
    return res
      .status(200)
      .json(
        ApiResponse.success("Registrations retrieved", registrations, meta),
      );
  }

  static async listMyRecordings(req: Request, res: Response) {
    const query = req.query as unknown as ListMyRecordingsQueryInput;

    const { recordings, meta } = await EventService.listMyRecordings(
      req.userId!,
      query.page,
      query.limit,
      query.search,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Recordings retrieved", recordings, meta));
  }
}
