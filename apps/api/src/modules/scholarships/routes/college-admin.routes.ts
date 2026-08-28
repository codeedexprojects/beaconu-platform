import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { ScholarshipCollegeAdminController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));
const view = authorize("scholarships.view");
const manage = authorize("scholarships.manage");

router.get("/configs", view, ScholarshipCollegeAdminController.listConfigs);
router.post("/configs", manage, ScholarshipCollegeAdminController.createConfig);
router.patch(
  "/configs/:id",
  manage,
  ScholarshipCollegeAdminController.updateConfig,
);

router.get(
  "/applications",
  view,
  ScholarshipCollegeAdminController.listApplications,
);
router.patch(
  "/applications/:id/review",
  manage,
  ScholarshipCollegeAdminController.reviewApplication,
);

export default router;
