import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { PlatformUsersController } from "../controllers/platform-users.controller";

const router: Router = Router();

router.get(
  "/profiles",
  authenticate,
  authorizeUserType("platform_admin"),
  PlatformUsersController.getAllProfiles,
);
router.get(
  "/blink-users/pending",
  authenticate,
  authorizeUserType("platform_admin"),
  PlatformUsersController.getPendingBlinkUsers,
);

router.patch(
  "/blink-users/:id/status",
  authenticate,
  authorizeUserType("platform_admin"),
  PlatformUsersController.updateBlinkUserStatus,
);

export default router;
