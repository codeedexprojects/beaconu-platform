import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import {
  createPlatformAdminSchema,
  updatePlatformAdminSchema,
  updatePlatformAdminStatusSchema,
} from "@beaconu/validation";
import { PlatformAdminMgmtController } from "../controllers/platform-admin-mgmt.controller";

const router: Router = Router();
router.use(authenticate, authorizeUserType("platform_admin"));

router.get("/", PlatformAdminMgmtController.listAdmins);
router.post(
  "/",
  validate(createPlatformAdminSchema),
  PlatformAdminMgmtController.createAdmin,
);
router.put(
  "/:id",
  validate(updatePlatformAdminSchema),
  PlatformAdminMgmtController.updateAdmin,
);
router.patch(
  "/:id/status",
  validate(updatePlatformAdminStatusSchema),
  PlatformAdminMgmtController.updateStatus,
);
router.delete("/:id", PlatformAdminMgmtController.deleteAdmin);

export default router;
