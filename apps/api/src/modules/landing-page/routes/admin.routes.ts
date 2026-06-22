import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeLeadsController } from "@/modules/platform-admin/controllers/college-leads.controller";

const router: Router = Router();

router.get(
  "/stats",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("leads.view"),
  CollegeLeadsController.getStats,
);

router.post(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("leads.manage"),
  CollegeLeadsController.create,
);

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("leads.view"),
  CollegeLeadsController.list,
);

router.get(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("leads.view"),
  CollegeLeadsController.getById,
);

router.patch(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("leads.manage"),
  CollegeLeadsController.update,
);

router.patch(
  "/:id/status",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("leads.manage"),
  CollegeLeadsController.updateStatus,
);

export default router;
