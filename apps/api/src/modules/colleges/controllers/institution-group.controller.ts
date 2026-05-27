import { Request, Response } from "express";
import { z } from "zod";
import { ApiResponse } from "@/shared/responses/api-response";
import {
  enableInstitutionGroupSchema,
  joinGroupSchema,
} from "@beaconu/validation";
import { InstitutionGroupService } from "../services/institution-group.service";

const idParam = z.object({ id: z.string() });

export class InstitutionGroupController {
  static async getGroupForCollege(req: Request, res: Response): Promise<void> {
    const { id } = idParam.parse(req.params);
    const group = await InstitutionGroupService.getGroupForCollege(id);
    res
      .status(200)
      .json(
        ApiResponse.success(
          group ? "Institution group fetched" : "No institution group",
          group,
        ),
      );
  }

  static async enableGroup(req: Request, res: Response): Promise<void> {
    const { id } = idParam.parse(req.params);
    const data = enableInstitutionGroupSchema.parse(req.body);
    const group = await InstitutionGroupService.enableForCollege(id, data);
    res
      .status(201)
      .json(ApiResponse.success("Institution group enabled", group));
  }

  static async disableGroup(req: Request, res: Response): Promise<void> {
    const { id } = idParam.parse(req.params);
    const group = await InstitutionGroupService.disableForCollege(id);
    res
      .status(200)
      .json(ApiResponse.success("Institution group disabled", group));
  }

  static async getMyGroup(req: Request, res: Response): Promise<void> {
    const collegeId = req.collegeId!;
    const result =
      await InstitutionGroupService.getMyGroupMembership(collegeId);
    res
      .status(200)
      .json(
        ApiResponse.success(
          result ? "Group membership fetched" : "Not in any group",
          result,
        ),
      );
  }

  static async joinGroup(req: Request, res: Response): Promise<void> {
    const collegeId = req.collegeId!;
    const { group_code } = joinGroupSchema.parse(req.body);
    const membership = await InstitutionGroupService.joinGroupByCode(
      collegeId,
      group_code,
    );
    res
      .status(201)
      .json(
        ApiResponse.success(
          "Successfully joined institution group",
          membership,
        ),
      );
  }
}
