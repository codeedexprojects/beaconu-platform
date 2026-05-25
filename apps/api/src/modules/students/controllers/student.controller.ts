import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { studentSchemas } from "../validators/students.validator";
import { StudentsQuery } from "../queries/students.query";
import { StudentsService } from "../services/students.service";

export class StudentController {
  static async getProfile(req: Request, res: Response): Promise<void> {
    const profile = await StudentsQuery.getProfile(req.userId!);
    res.status(200).json(ApiResponse.success("Profile fetched", profile));
  }

  static async updateProfile(req: Request, res: Response): Promise<void> {
    const data = studentSchemas.updateProfile.parse(req.body);
    const profile = await StudentsService.updateProfile(req.userId!, data);
    res.status(200).json(ApiResponse.success("Profile updated", profile));
  }
}
