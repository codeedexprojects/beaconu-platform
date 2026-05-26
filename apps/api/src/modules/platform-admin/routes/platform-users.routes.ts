import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { PlatformUsersController } from "../controllers/platform-users.controller";

const router: Router = Router();

router.get(
  "/profiles",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("students.view"),
  PlatformUsersController.getAllProfiles,
);
router.get(
  "/blink-users/pending",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("blink.view"),
  PlatformUsersController.getPendingBlinkUsers,
);

router.patch(
  "/blink-users/:id/status",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("blink.manage"),
  PlatformUsersController.updateBlinkUserStatus,
);

export default router;
