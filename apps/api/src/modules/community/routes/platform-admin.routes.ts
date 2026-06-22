import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { Router } from "express";
import { CommunityPlatformAdminController } from "../controllers/platform-admin.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  CommunityPlatformAdminController.list,
);
router.patch(
  "/:id/disable",
  authenticate,
  authorizeUserType("platform_admin"),
  CommunityPlatformAdminController.disable,
);

export default router;
