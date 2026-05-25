import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { NotificationsAdminController } from "../controllers/platform-admin.controller";

const router: Router = Router();

router.post(
  "/push",
  authenticate,
  authorizeUserType("platform_admin"),
  NotificationsAdminController.sendPush,
);

export default router;
