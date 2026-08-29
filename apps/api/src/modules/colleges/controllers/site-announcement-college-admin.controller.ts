import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { SiteAnnouncementService } from "../services/site-announcement.service";
import {
  createSiteAnnouncementSchema,
  updateSiteAnnouncementSchema,
  reorderSiteAnnouncementsSchema,
} from "../validators/site-announcement.validator";

export class SiteAnnouncementCollegeAdminController {
  static async list(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const result = await SiteAnnouncementService.list(collegeId);
    return res
      .status(200)
      .json(ApiResponse.success("Announcements fetched", result));
  }

  static async create(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const body = createSiteAnnouncementSchema.parse(req.body);
    const result = await SiteAnnouncementService.create(collegeId, body);
    return res
      .status(201)
      .json(ApiResponse.success("Announcement added", result));
  }

  static async update(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    const body = updateSiteAnnouncementSchema.parse(req.body);
    const result = await SiteAnnouncementService.update(collegeId, id, body);
    return res
      .status(200)
      .json(ApiResponse.success("Announcement updated", result));
  }

  static async remove(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    await SiteAnnouncementService.remove(collegeId, id);
    return res
      .status(200)
      .json(ApiResponse.success("Announcement removed", null));
  }

  static async reorder(req: Request, res: Response) {
    const collegeId = req.collegeId!;
    const body = reorderSiteAnnouncementsSchema.parse(req.body);
    const result = await SiteAnnouncementService.reorder(
      collegeId,
      body.orderedIds,
    );
    return res
      .status(200)
      .json(ApiResponse.success("Announcement order updated", result));
  }
}
