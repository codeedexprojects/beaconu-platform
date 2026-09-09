import { Request, Response } from "express";
import { ApiResponse } from "@/shared/responses/api-response";
import { StudentReferralService } from "../services/student-referral.service";
import {
  referralCodeParamSchema,
  resolveInviteSchema,
} from "../validators/student-referral.validator";

export class EngagementPublicController {
  /** Called by the app on first open, before the invitee has an account, to
   * confirm a code recovered from a deep link (or typed by hand) is real. */
  static async resolveInviteCode(req: Request, res: Response): Promise<void> {
    const { code } = referralCodeParamSchema.parse(req.params);
    const result = await StudentReferralService.resolveCode(code);
    res.status(200).json(ApiResponse.success("Invite code valid", result));
  }

  /** Deferred deep link resolution: the app posts whatever it recovered after
   * install (Play Install Referrer string on Android, clipboard or manual
   * entry on iOS). Always 200 — an organic install legitimately has no
   * referral and must not look like an error to the client. */
  static async resolveFromInstall(req: Request, res: Response): Promise<void> {
    const input = resolveInviteSchema.parse(req.body);
    const result = await StudentReferralService.resolveFromInstall(input);
    res.status(200).json(ApiResponse.success("Invite resolved", result));
  }
}
