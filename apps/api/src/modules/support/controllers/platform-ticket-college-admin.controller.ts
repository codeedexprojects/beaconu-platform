import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { PlatformTicketService } from "../services/platform-ticket.service";
import {
  createPlatformTicketSchema,
  sendPlatformTicketMessageSchema,
  listPlatformTicketsQuerySchema,
  getPlatformTicketQuerySchema,
} from "../validators/platform-ticket.validator";

export class PlatformTicketCollegeAdminController {
  static async create(req: Request, res: Response) {
    const body = createPlatformTicketSchema.parse(req.body);
    const result = await PlatformTicketService.create(
      req.collegeId!,
      req.userId as string,
      body,
    );
    return res.status(201).json(ApiResponse.success("Query submitted", result));
  }

  static async list(req: Request, res: Response) {
    const query = listPlatformTicketsQuerySchema.parse(req.query);
    const result = await PlatformTicketService.listForCollege(
      req.collegeId!,
      { status: query.status, type: query.type, search: query.search },
      { page: query.page, limit: query.limit },
    );
    return res.status(200).json(ApiResponse.success("Queries fetched", result));
  }

  static async getById(req: Request, res: Response) {
    const query = getPlatformTicketQuerySchema.parse(req.query);
    const result = await PlatformTicketService.getForCollege(
      req.collegeId!,
      req.params.id as string,
      { page: query.page, limit: query.limit },
    );
    return res.status(200).json(ApiResponse.success("Query fetched", result));
  }

  static async addMessage(req: Request, res: Response) {
    const body = sendPlatformTicketMessageSchema.parse(req.body);
    const result = await PlatformTicketService.addCollegeMessage(
      req.collegeId!,
      req.userId as string,
      req.params.id as string,
      body,
    );
    return res.status(201).json(ApiResponse.success("Message sent", result));
  }
}
