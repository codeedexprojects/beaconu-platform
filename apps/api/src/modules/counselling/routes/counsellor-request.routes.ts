import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { CounsellingPlatformAdminController } from "../controllers/platform-admin.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("counsellors.view"),
  CounsellingPlatformAdminController.listRequests,
);
router.get(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("counsellors.view"),
  CounsellingPlatformAdminController.getRequestById,
);
router.patch(
  "/:id/status",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("counsellors.manage"),
  CounsellingPlatformAdminController.updateRequestStatus,
);

export default router;
