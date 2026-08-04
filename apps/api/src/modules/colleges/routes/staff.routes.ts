import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import {
  authorize,
  authorizeAny,
  authorizeUserType,
  denyRoleSlugs,
} from "@/shared/middleware/authorize";
import { CollegeRolesController } from "../controllers/college-roles.controller";

const router: Router = Router();

const staffAuth = [authenticate, authorizeUserType("staff_member")];
const staffWriteAuth = [...staffAuth, denyRoleSlugs("sub_admin")];

router.get(
  "/permissions",
  ...staffAuth,
  authorizeAny("staff.view", "staff.manage"),
  CollegeRolesController.listPermissions,
);

router.get(
  "/roles",
  ...staffAuth,
  authorizeAny("staff.view", "staff.manage"),
  CollegeRolesController.listRoles,
);

router.post(
  "/roles",
  ...staffWriteAuth,
  authorize("staff.manage"),
  CollegeRolesController.createRole,
);

router.patch(
  "/roles/:id",
  ...staffWriteAuth,
  authorize("staff.manage"),
  CollegeRolesController.updateRole,
);

router.delete(
  "/roles/:id",
  ...staffWriteAuth,
  authorize("staff.manage"),
  CollegeRolesController.deleteRole,
);

router.get(
  "/staff",
  ...staffAuth,
  authorizeAny("staff.view", "staff.manage"),
  CollegeRolesController.listStaff,
);

router.post(
  "/staff",
  ...staffWriteAuth,
  authorize("staff.manage"),
  CollegeRolesController.inviteStaff,
);

router.patch(
  "/staff/:id",
  ...staffWriteAuth,
  authorize("staff.manage"),
  CollegeRolesController.updateStaff,
);

export default router;
