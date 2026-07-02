import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeDashboardController } from "../controllers/college-dashboard.controller";

const router: Router = Router();

const adminAuth = [
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("colleges.view"),
];

router.get("/", ...adminAuth, CollegeDashboardController.listColleges);
router.get("/stats", ...adminAuth, CollegeDashboardController.getStats);
router.get("/:id", ...adminAuth, CollegeDashboardController.getCollegeDetail);
router.patch(
  "/:id/listing",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("colleges.manage"),
  CollegeDashboardController.updateListingStatus,
);

export default router;
