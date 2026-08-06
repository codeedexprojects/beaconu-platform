import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { HostelEnrollmentService } from "../services/hostel-enrollment.service";

export class HostelStudentController {
  static async getMyEnrollment(req: Request, res: Response) {
    const result = await HostelEnrollmentService.getMyEnrollment(
      req.userId as string,
    );
    return res.json(ApiResponse.success("Hostel enrollment fetched", result));
  }
}
