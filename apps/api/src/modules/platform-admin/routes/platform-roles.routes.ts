import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { PlatformRolesController } from "../controllers/platform-roles.controller";

const router: Router = Router();

router.get(
  "/permissions",
  authenticate,
  authorizeUserType("platform_admin"),
  PlatformRolesController.listPermissions,
);
router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  PlatformRolesController.listRoles,
);
router.post(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("platform.roles.manage"),
  PlatformRolesController.createRole,
);
router.put(
  "/:roleId/permissions",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("platform.roles.manage"),
  PlatformRolesController.updateRolePermissions,
);

export default router;
