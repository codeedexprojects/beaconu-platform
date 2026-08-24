import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { PlatformTicketSuperAdminController } from "../controllers/platform-ticket-super-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("platform_admin"));

router.get(
  "/",
  authorize("college-tickets.view"),
  PlatformTicketSuperAdminController.list,
);
router.get(
  "/:id",
  authorize("college-tickets.view"),
  PlatformTicketSuperAdminController.getById,
);
router.post(
  "/:id/messages",
  authorize("college-tickets.manage"),
  PlatformTicketSuperAdminController.addMessage,
);
router.patch(
  "/:id/status",
  authorize("college-tickets.manage"),
  PlatformTicketSuperAdminController.updateStatus,
);

export default router;
