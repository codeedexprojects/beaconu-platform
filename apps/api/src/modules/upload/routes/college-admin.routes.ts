import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import {
  authorizeAny,
  authorizeUserType,
  denyRoleSlugs,
} from "@/shared/middleware/authorize";
import { CollegeAdminUploadController } from "../controllers/college-admin.controller";

const router: Router = Router();

const staffWriteAuth = [
  authenticate,
  authorizeUserType("staff_member"),
  denyRoleSlugs("sub_admin"),
];

router.post(
  "/presign",
  ...staffWriteAuth,
  authorizeAny("profile.edit", "academics.manage"),
  CollegeAdminUploadController.presign,
);

router.post(
  "/verify",
  ...staffWriteAuth,
  authorizeAny("profile.edit", "academics.manage"),
  CollegeAdminUploadController.verify,
);

router.delete(
  "/file",
  ...staffWriteAuth,
  authorizeAny("profile.edit", "academics.manage"),
  CollegeAdminUploadController.remove,
);

export default router;
