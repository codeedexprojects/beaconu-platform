import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { PlatformTicketService } from "../services/platform-ticket.service";
import {
  sendPlatformTicketMessageSchema,
  listPlatformTicketsQuerySchema,
  updatePlatformTicketStatusSchema,
  getPlatformTicketQuerySchema,
} from "../validators/platform-ticket.validator";

export class PlatformTicketSuperAdminController {
  static async list(req: Request, res: Response) {
    const query = listPlatformTicketsQuerySchema.parse(req.query);
    const result = await PlatformTicketService.listForPlatform(
      {
        status: query.status,
        type: query.type,
        collegeId: query.college_id,
        search: query.search,
      },
      { page: query.page, limit: query.limit },
    );
    return res.status(200).json(ApiResponse.success("Queries fetched", result));
  }

  static async getById(req: Request, res: Response) {
    const query = getPlatformTicketQuerySchema.parse(req.query);
    const result = await PlatformTicketService.getForPlatform(
      req.params.id as string,
      { page: query.page, limit: query.limit },
    );
    return res.status(200).json(ApiResponse.success("Query fetched", result));
  }

  static async addMessage(req: Request, res: Response) {
    const body = sendPlatformTicketMessageSchema.parse(req.body);
    const result = await PlatformTicketService.addAdminMessage(
      req.userId as string,
      req.params.id as string,
      body,
    );
    return res.status(201).json(ApiResponse.success("Reply sent", result));
  }

  static async updateStatus(req: Request, res: Response) {
    const body = updatePlatformTicketStatusSchema.parse(req.body);
    const result = await PlatformTicketService.updateStatus(
      req.params.id as string,
      body,
    );
    return res.status(200).json(ApiResponse.success("Status updated", result));
  }
}
