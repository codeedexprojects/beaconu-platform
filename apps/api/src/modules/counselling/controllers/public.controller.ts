import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { counsellorRequestSchemas } from "../validators/counsellor-request.validator";
import { CounsellorRequestService } from "../services/counsellor-request.service";

export class CounsellingPublicController {
  // POST /api/v1/public/counsellor-requests — public, no auth
  static async submitRequest(req: Request, res: Response) {
    const data = counsellorRequestSchemas.submit.parse(req.body);
    const result = await CounsellorRequestService.submit(data);
    return res
      .status(201)
      .json(
        ApiResponse.success(
          "Thank you! Your request has been submitted and is under review.",
          result,
        ),
      );
  }
}
