import { Router } from "express";
import { validate } from "@/shared/middleware/validate";
import { resolveInviteSchema } from "../validators/student-referral.validator";
import { EngagementPublicController } from "../controllers/public.controller";

const router: Router = Router();

// Mounted at /api/v1/public/invite, not /public/referrals — that path is
// already the Blink resolver's bare :code catch-all.

// Before "/:code" so the param route doesn't swallow it.
router.post(
  "/resolve",
  validate(resolveInviteSchema),
  EngagementPublicController.resolveFromInstall,
);

router.get("/:code", EngagementPublicController.resolveInviteCode);

export default router;
