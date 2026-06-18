import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import { updatePlatformConfigSchema } from "../validators/platform-config.validator";
import { PlatformConfigController } from "../controllers/platform-admin.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("platform.settings.view"),
  PlatformConfigController.getConfig,
);

router.patch(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("platform.settings.manage"),
  validate(updatePlatformConfigSchema),
  PlatformConfigController.updateConfig,
);

export default router;
