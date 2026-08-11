import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { NoticeService } from "../services/notice.service";
import { studentNoticesQuerySchema } from "../validators/notice.validator";

export class StudentNoticeController {
  static async list(req: Request, res: Response) {
    const query = studentNoticesQuerySchema.parse(req.query);
    const result = await NoticeService.listForStudent(
      req.userId as string,
      query.college_id,
      {
        status: query.status,
        category: query.category,
        search: query.search,
        fromDate: query.from_date,
        toDate: query.to_date,
      },
      { page: query.page, limit: query.limit },
    );
    return res.status(200).json(ApiResponse.success("Notices fetched", result));
  }

  static async getById(req: Request, res: Response) {
    const result = await NoticeService.getForStudent(
      req.userId as string,
      req.params.id as string,
    );
    return res.status(200).json(ApiResponse.success("Notice fetched", result));
  }
}
