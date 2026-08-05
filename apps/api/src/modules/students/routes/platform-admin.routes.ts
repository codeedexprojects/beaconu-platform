import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { StudentsPlatformAdminController } from "../controllers/platform-admin.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("students.view"),
  StudentsPlatformAdminController.list,
);

router.get(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("students.view"),
  StudentsPlatformAdminController.getById,
);

router.patch(
  "/:id/status",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("students.manage"),
  StudentsPlatformAdminController.updateStatus,
);

export default router;
