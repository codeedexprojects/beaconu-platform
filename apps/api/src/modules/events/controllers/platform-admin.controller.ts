import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { EventService } from "../services/event.service";
import { ListEventsQueryInput } from "../validators/event.validator";

export class EventPlatformAdminController {
  static async create(req: Request, res: Response) {
    const event = await EventService.create(
      req.body,
      req.userType!,
      req.userId!,
    );
    return res.status(201).json(ApiResponse.success("Event created", event));
  }

  static async listAll(req: Request, res: Response) {
    const query = req.query as unknown as ListEventsQueryInput;
    const { events, meta } = await EventService.listAll(query);
    return res
      .status(200)
      .json(ApiResponse.success("Events retrieved", events, meta));
  }

  static async getById(req: Request, res: Response) {
    const event = await EventService.getById(req.params["id"] as string);
    return res.status(200).json(ApiResponse.success("Event retrieved", event));
  }

  static async update(req: Request, res: Response) {
    const event = await EventService.update(
      req.params["id"] as string,
      req.body,
    );
    return res.status(200).json(ApiResponse.success("Event updated", event));
  }

  static async updateStatus(req: Request, res: Response) {
    const event = await EventService.updateStatus(
      req.params["id"] as string,
      req.body,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Event status updated", event));
  }

  static async softDelete(req: Request, res: Response) {
    const event = await EventService.softDelete(req.params["id"] as string);
    return res.status(200).json(ApiResponse.success("Event archived", event));
  }

  static async uploadRecording(req: Request, res: Response) {
    const event = await EventService.uploadRecording(
      req.params["id"] as string,
      req.body,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Recording uploaded", event));
  }

  static async listRegistrations(req: Request, res: Response) {
    const page = Number(req.query["page"] ?? 1);
    const limit = Number(req.query["limit"] ?? 10);
    const { registrations, summary, meta } =
      await EventService.listEventRegistrations(
        req.params["id"] as string,
        page,
        limit,
      );
    return res
      .status(200)
      .json(
        ApiResponse.success(
          "Registrations retrieved",
          { registrations, summary },
          meta,
        ),
      );
  }
}
