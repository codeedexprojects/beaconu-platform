import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { PlatformRolesController } from "../controllers/platform-roles.controller";
import { PlatformUsersController } from "../controllers/platform-users.controller";

const router: Router = Router();

router.get(
  "/permissions",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("platform.roles.view"),
  PlatformRolesController.listPermissions,
);
router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("platform.roles.view"),
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
router.delete(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("platform.roles.manage"),
  PlatformRolesController.deleteRole,
);
router.get(
  "/profiles",
  authenticate,
  authorizeUserType("platform_admin"),
  PlatformUsersController.getAllProfiles,
);

export default router;
