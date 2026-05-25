import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeLeadsController } from "@/modules/platform-admin/controllers/college-leads.controller";

const router: Router = Router();

// All admin routes require platform_admin authentication
router.get(
  "/stats",
  authenticate,
  authorizeUserType("platform_admin"),
  CollegeLeadsController.getStats,
);

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  CollegeLeadsController.list,
);

router.get(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  CollegeLeadsController.getById,
);

router.patch(
  "/:id/status",
  authenticate,
  authorizeUserType("platform_admin"),
  CollegeLeadsController.updateStatus,
);

export default router;
