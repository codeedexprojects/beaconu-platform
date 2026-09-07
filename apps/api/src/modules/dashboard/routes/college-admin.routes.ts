import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { DashboardCollegeAdminController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));

router.get("/sidebar-hints", DashboardCollegeAdminController.getSidebarHints);

const reportsAuth = authorize("reports.view");

router.get(
  "/reports/enrollment-overview",
  reportsAuth,
  DashboardCollegeAdminController.getEnrollmentOverview,
);
router.get(
  "/reports/funnel",
  reportsAuth,
  DashboardCollegeAdminController.getAdmissionsFunnel,
);
router.get(
  "/reports/demographics",
  reportsAuth,
  DashboardCollegeAdminController.getAgeGenderInsights,
);
router.get(
  "/reports/geography",
  reportsAuth,
  DashboardCollegeAdminController.getGeographicOrigin,
);

export default router;
