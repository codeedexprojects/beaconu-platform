import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { BeaconuCardService } from "../services/beaconu-card.service";

export class EngagementStudentController {
  static async getMyCard(req: Request, res: Response): Promise<void> {
    const card = await BeaconuCardService.getMine(req.userId!);
    res.status(200).json(ApiResponse.success("BeaconU card fetched", card));
  }
}
