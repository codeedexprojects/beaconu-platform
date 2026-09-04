import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import {
  createPlatformAdminSchema,
  updatePlatformAdminSchema,
  updatePlatformAdminStatusSchema,
} from "@beaconu/validation";
import { PlatformAdminMgmtController } from "../controllers/platform-admin-mgmt.controller";

const router: Router = Router();
router.use(authenticate, authorizeUserType("platform_admin"));

router.get(
  "/",
  authorize("platform.admins.view"),
  PlatformAdminMgmtController.listAdmins,
);
router.post(
  "/",
  authorize("platform.admins.manage"),
  validate(createPlatformAdminSchema),
  PlatformAdminMgmtController.createAdmin,
);
router.put(
  "/:id",
  authorize("platform.admins.manage"),
  validate(updatePlatformAdminSchema),
  PlatformAdminMgmtController.updateAdmin,
);
router.patch(
  "/:id/status",
  authorize("platform.admins.manage"),
  validate(updatePlatformAdminStatusSchema),
  PlatformAdminMgmtController.updateStatus,
);
router.delete(
  "/:id",
  authorize("platform.admins.manage"),
  PlatformAdminMgmtController.deleteAdmin,
);

router.get(
  "/sessions",
  authorize("platform.admins.sessions.manage"),
  PlatformAdminMgmtController.listAllSessions,
);
router.get(
  "/:id/sessions",
  authorize("platform.admins.sessions.manage"),
  PlatformAdminMgmtController.listSessions,
);
router.delete(
  "/:id/sessions/:sessionId",
  authorize("platform.admins.sessions.manage"),
  PlatformAdminMgmtController.forceLogoutSession,
);
router.delete(
  "/:id/sessions",
  authorize("platform.admins.sessions.manage"),
  PlatformAdminMgmtController.forceLogoutAllSessions,
);

export default router;
