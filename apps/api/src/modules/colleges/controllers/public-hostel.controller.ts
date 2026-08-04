import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { HostelService } from "../services/hostel.service";
import {
  publicHostelListParamSchema,
  publicHostelDetailParamSchema,
} from "../validators/hostel.validator";

export class PublicHostelController {
  static async listPublicHostels(req: Request, res: Response) {
    const { slug } = publicHostelListParamSchema.parse(req.params);

    const hostels = await HostelService.getPublicHostelList(slug);
    return res
      .status(200)
      .json(ApiResponse.success("College hostels fetched", hostels));
  }

  static async getPublicHostelDetail(req: Request, res: Response) {
    const { slug, hostelId } = publicHostelDetailParamSchema.parse(req.params);

    const hostel = await HostelService.getPublicHostelDetail(slug, hostelId);
    return res
      .status(200)
      .json(ApiResponse.success("Hostel detail fetched", hostel));
  }
}
