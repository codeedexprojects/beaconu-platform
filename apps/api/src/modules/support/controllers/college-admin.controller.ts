import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { TicketService } from "../services/ticket.service";
import {
  sendMessageSchema,
  listTicketsQuerySchema,
  updateTicketStatusSchema,
} from "../validators/ticket.validator";

export class CollegeAdminTicketController {
  static async list(req: Request, res: Response) {
    const query = listTicketsQuerySchema.parse(req.query);
    const result = await TicketService.listForCollege(
      req.collegeId!,
      { status: query.status, search: query.search },
      { page: query.page, limit: query.limit },
    );
    return res.status(200).json(ApiResponse.success("Queries fetched", result));
  }

  static async getById(req: Request, res: Response) {
    const result = await TicketService.getForCollege(
      req.collegeId!,
      req.params.id as string,
    );
    return res.status(200).json(ApiResponse.success("Query fetched", result));
  }

  static async addMessage(req: Request, res: Response) {
    const body = sendMessageSchema.parse(req.body);
    const result = await TicketService.addAdminMessage(
      req.userId as string,
      req.collegeId!,
      req.params.id as string,
      body,
    );
    return res.status(201).json(ApiResponse.success("Reply sent", result));
  }

  static async updateStatus(req: Request, res: Response) {
    const body = updateTicketStatusSchema.parse(req.body);
    const result = await TicketService.updateStatus(
      req.collegeId!,
      req.params.id as string,
      body,
    );
    return res.status(200).json(ApiResponse.success("Status updated", result));
  }
}
