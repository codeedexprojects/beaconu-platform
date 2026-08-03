import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { ScholarshipCollegeAdminController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));

router.get("/configs", ScholarshipCollegeAdminController.listConfigs);
router.post("/configs", ScholarshipCollegeAdminController.createConfig);
router.patch("/configs/:id", ScholarshipCollegeAdminController.updateConfig);

router.get("/applications", ScholarshipCollegeAdminController.listApplications);
router.patch(
  "/applications/:id/review",
  ScholarshipCollegeAdminController.reviewApplication,
);

export default router;
