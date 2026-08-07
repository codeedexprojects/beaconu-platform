import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { HostelEnrollmentService } from "../services/hostel-enrollment.service";
import { HostelBrowseService } from "../services/hostel-browse.service";
import {
  collegeIdQuerySchema,
  hostelIdParamSchema,
} from "../validators/hostel.validator";

export class HostelStudentController {
  static async getMyEnrollment(req: Request, res: Response) {
    const result = await HostelEnrollmentService.getMyEnrollment(
      req.userId as string,
    );
    return res.json(ApiResponse.success("Hostel enrollment fetched", result));
  }

  static async listHostels(req: Request, res: Response) {
    const { college_id } = collegeIdQuerySchema.parse(req.query);
    const result = await HostelBrowseService.listForStudent(
      req.userId as string,
      college_id,
    );
    return res.json(ApiResponse.success("Hostels fetched", result));
  }

  static async getHostelDetail(req: Request, res: Response) {
    const { college_id } = collegeIdQuerySchema.parse(req.query);
    const { hostelId } = hostelIdParamSchema.parse(req.params);
    const result = await HostelBrowseService.getDetailForStudent(
      req.userId as string,
      college_id,
      hostelId,
    );
    return res.json(ApiResponse.success("Hostel detail fetched", result));
  }
}
