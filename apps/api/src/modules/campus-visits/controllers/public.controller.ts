import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { CampusVisitsQuery } from "../queries/campus-visits.query";

export class PublicCampusVisitController {
  static async listAmbassadors(req: Request, res: Response) {
    const ambassadors = await CampusVisitsQuery.listAmbassadorsForCollege(
      req.params.collegeId,
    );
    return res.json(ApiResponse.success("Ambassadors fetched", ambassadors));
  }
}
