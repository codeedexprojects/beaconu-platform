import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import {
  listWithdrawalRequestsQuerySchema,
  updateWithdrawalStatusSchema,
} from "../validators/blink.validator";
import { BlinkPlatformAdminController } from "../controllers/platform-admin.controller";

const router: Router = Router();

router.get(
  "/withdrawals",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("blink.view"),
  validate(listWithdrawalRequestsQuerySchema, "query"),
  BlinkPlatformAdminController.listWithdrawalRequests,
);

router.patch(
  "/withdrawals/:id/status",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("blink.manage"),
  validate(updateWithdrawalStatusSchema),
  BlinkPlatformAdminController.updateWithdrawalStatus,
);

export default router;
