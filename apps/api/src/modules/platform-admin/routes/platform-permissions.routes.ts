import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { PlatformPermissionsController } from "../controllers/platform-permissions.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("platform.roles.view"),
  PlatformPermissionsController.listPermissions,
);

export default router;
