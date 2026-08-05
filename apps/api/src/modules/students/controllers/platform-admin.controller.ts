import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { studentSchemas } from "../validators/students.validator";
import { StudentsService } from "../services/students.service";

export class StudentsPlatformAdminController {
  static async list(req: Request, res: Response): Promise<void> {
    const query = studentSchemas.listStudentsQuery.parse(req.query);
    const result = await StudentsService.listForAdmin(query);
    res
      .status(200)
      .json(ApiResponse.success("Students fetched", result.data, result.meta));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const result = await StudentsService.getForAdmin(req.params.id as string);
    res.status(200).json(ApiResponse.success("Student fetched", result));
  }

  static async updateStatus(req: Request, res: Response): Promise<void> {
    const body = studentSchemas.updateStudentStatus.parse(req.body);
    const result = await StudentsService.setStatus(
      req.params.id as string,
      body.status,
    );
    res.status(200).json(ApiResponse.success("Student status updated", result));
  }
}
