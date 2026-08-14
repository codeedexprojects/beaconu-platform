import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CollegeRegistrationService } from "@/modules/colleges/services/college-registration.service";
import { matchGroupSchema } from "../validators/group-finder.validator";
import { GroupFinderQuery } from "../queries/group-finder.query";

export class GroupFinderStudentController {
  static async match(req: Request, res: Response): Promise<void> {
    const body = matchGroupSchema.parse(req.body);
    const result = await GroupFinderQuery.match(body);
    res.status(200).json(ApiResponse.success("Group match results", result));
  }

  // "Course" dropdown (e.g. B.Tech) — global taxonomy, not college-scoped.
  static async getStudyLevels(_req: Request, res: Response): Promise<void> {
    const result = await CollegeRegistrationService.getStudyLevels();
    res.status(200).json(ApiResponse.success("Study levels fetched", result));
  }

  // "Program/Major" dropdown (e.g. Computer Science Engineering) — streams
  // with their nested disciplines, global taxonomy.
  static async getStreams(_req: Request, res: Response): Promise<void> {
    const result = await CollegeRegistrationService.getStreams("");
    res.status(200).json(ApiResponse.success("Streams fetched", result));
  }
}
