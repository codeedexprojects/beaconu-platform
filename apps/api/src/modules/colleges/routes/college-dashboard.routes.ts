import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeDashboardController } from "../controllers/college-dashboard.controller";

const router: Router = Router();

const adminAuth = [authenticate, authorizeUserType("platform_admin")];

router.get("/", ...adminAuth, CollegeDashboardController.listColleges);
router.get("/stats", ...adminAuth, CollegeDashboardController.getStats);
router.get("/:id", ...adminAuth, CollegeDashboardController.getCollegeDetail);

export default router;
