import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { ChatService } from "../services/chat.service";
import {
  listAmbassadorsQuerySchema,
  startConversationSchema,
  sendMessageSchema,
  chatPaginationQuerySchema,
} from "../validators/chat.validator";

export class StudentChatController {
  static async listAmbassadors(req: Request, res: Response) {
    const { college_id } = listAmbassadorsQuerySchema.parse(req.query);
    const result = await ChatService.listAmbassadorsForCollege(college_id);
    return res.json(ApiResponse.success("Ambassadors fetched", result));
  }

  static async startConversation(req: Request, res: Response) {
    const { ambassador_id } = startConversationSchema.parse(req.body);
    const result = await ChatService.startOrGetConversation(
      req.userId!,
      ambassador_id,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Conversation ready", result));
  }

  static async listConversations(req: Request, res: Response) {
    const { page, limit } = chatPaginationQuerySchema.parse(req.query);
    const { conversations, total } = await ChatService.listConversations(
      "student",
      req.userId!,
      page,
      limit,
    );
    return res.json(
      ApiResponse.success("Conversations fetched", conversations, {
        total,
        page,
        limit,
        hasNext: page * limit < total,
      }),
    );
  }

  static async getMessages(req: Request, res: Response) {
    const { page, limit } = chatPaginationQuerySchema.parse(req.query);
    const { messages, total } = await ChatService.getMessages(
      "student",
      req.userId!,
      req.params.id as string,
      page,
      limit,
    );
    return res.json(
      ApiResponse.success("Messages fetched", messages, {
        total,
        page,
        limit,
        hasNext: page * limit < total,
      }),
    );
  }

  static async sendMessage(req: Request, res: Response) {
    const data = sendMessageSchema.parse(req.body);
    const result = await ChatService.sendMessage(
      "student",
      req.userId!,
      req.params.id as string,
      data,
    );
    return res.status(201).json(ApiResponse.success("Message sent", result));
  }

  static async markRead(req: Request, res: Response) {
    await ChatService.markRead("student", req.userId!, req.params.id as string);
    return res.json(ApiResponse.success("Marked as read", null));
  }
}
