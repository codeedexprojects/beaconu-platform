import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import { updateCounsellorStatusSchema } from "../validators/counselling.validator";
import {
  listWithdrawalRequestsQuerySchema,
  updateWithdrawalStatusSchema,
} from "../validators/sessions.validator";
import { CounsellingPlatformAdminController } from "../controllers/platform-admin.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("counsellors.view"),
  CounsellingPlatformAdminController.listAll,
);

router.get(
  "/withdrawals",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("counsellors.view"),
  validate(listWithdrawalRequestsQuerySchema, "query"),
  CounsellingPlatformAdminController.listWithdrawalRequests,
);
router.patch(
  "/withdrawals/:id/status",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("counsellors.manage"),
  validate(updateWithdrawalStatusSchema),
  CounsellingPlatformAdminController.updateWithdrawalStatus,
);

router.get(
  "/:id/detail",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("counsellors.view"),
  CounsellingPlatformAdminController.getDetail,
);
router.get(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("counsellors.view"),
  CounsellingPlatformAdminController.getById,
);
router.patch(
  "/:id/status",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("counsellors.manage"),
  validate(updateCounsellorStatusSchema),
  CounsellingPlatformAdminController.updateStatus,
);

export default router;
