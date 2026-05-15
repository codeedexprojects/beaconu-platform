import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { PlatformPermissionsController } from "../controllers/platform-permissions.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  PlatformPermissionsController.listPermissions,
);

router.post(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("platform.roles.manage"),
  PlatformPermissionsController.createPermission,
);

router.put(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("platform.roles.manage"),
  PlatformPermissionsController.updatePermission,
);

router.delete(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("platform.roles.manage"),
  PlatformPermissionsController.deletePermission,
);

export default router;
