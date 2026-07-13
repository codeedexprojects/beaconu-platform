import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { PlatformAdminUploadController } from "../controllers/platform-admin.controller";

const router: Router = Router();

router.post(
  "/presign",
  authenticate,
  authorizeUserType("platform_admin"),
  PlatformAdminUploadController.presign,
);

router.post(
  "/verify",
  authenticate,
  authorizeUserType("platform_admin"),
  PlatformAdminUploadController.verify,
);

router.delete(
  "/file",
  authenticate,
  authorizeUserType("platform_admin"),
  PlatformAdminUploadController.remove,
);

export default router;
