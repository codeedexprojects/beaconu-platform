import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { NoticeService } from "../services/notice.service";
import {
  createNoticeSchema,
  updateNoticeSchema,
  listNoticesQuerySchema,
} from "../validators/notice.validator";

export class CollegeAdminNoticeController {
  static async list(req: Request, res: Response) {
    const query = listNoticesQuerySchema.parse(req.query);
    const result = await NoticeService.listForCollege(
      req.collegeId!,
      { status: query.status, category: query.category, search: query.search },
      { page: query.page, limit: query.limit },
    );
    return res.status(200).json(ApiResponse.success("Notices fetched", result));
  }

  static async getById(req: Request, res: Response) {
    const result = await NoticeService.getForCollege(
      req.collegeId!,
      req.params.id as string,
    );
    return res.status(200).json(ApiResponse.success("Notice fetched", result));
  }

  static async create(req: Request, res: Response) {
    const body = createNoticeSchema.parse(req.body);
    const result = await NoticeService.create(
      req.collegeId!,
      req.userId as string,
      body,
    );
    return res
      .status(201)
      .json(ApiResponse.success("Notice published", result));
  }

  static async update(req: Request, res: Response) {
    const body = updateNoticeSchema.parse(req.body);
    const result = await NoticeService.update(
      req.collegeId!,
      req.params.id as string,
      body,
    );
    return res.status(200).json(ApiResponse.success("Notice updated", result));
  }

  static async archive(req: Request, res: Response) {
    const result = await NoticeService.archive(
      req.collegeId!,
      req.params.id as string,
    );
    return res.status(200).json(ApiResponse.success("Notice archived", result));
  }

  static async restore(req: Request, res: Response) {
    const result = await NoticeService.restore(
      req.collegeId!,
      req.params.id as string,
    );
    return res.status(200).json(ApiResponse.success("Notice restored", result));
  }
}
