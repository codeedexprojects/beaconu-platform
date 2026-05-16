import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { PlatformPermissionsController } from "../controllers/platform-permissions.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  PlatformPermissionsController.listPermissions,
);

export default router;
