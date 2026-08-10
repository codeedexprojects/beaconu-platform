import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { TicketService } from "../services/ticket.service";
import {
  createTicketSchema,
  sendMessageSchema,
  listTicketsQuerySchema,
} from "../validators/ticket.validator";

export class StudentTicketController {
  static async create(req: Request, res: Response) {
    const body = createTicketSchema.parse(req.body);
    const result = await TicketService.create(req.userId as string, body);
    return res.status(201).json(ApiResponse.success("Query submitted", result));
  }

  static async list(req: Request, res: Response) {
    const query = listTicketsQuerySchema.parse(req.query);
    const result = await TicketService.listMine(
      req.userId as string,
      { status: query.status, search: query.search },
      { page: query.page, limit: query.limit },
    );
    return res.status(200).json(ApiResponse.success("Queries fetched", result));
  }

  static async getById(req: Request, res: Response) {
    const result = await TicketService.getMine(
      req.userId as string,
      req.params.id as string,
    );
    return res.status(200).json(ApiResponse.success("Query fetched", result));
  }

  static async addMessage(req: Request, res: Response) {
    const body = sendMessageSchema.parse(req.body);
    const result = await TicketService.addMyMessage(
      req.userId as string,
      req.params.id as string,
      body,
    );
    return res.status(201).json(ApiResponse.success("Message sent", result));
  }
}
