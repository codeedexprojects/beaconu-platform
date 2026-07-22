import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminCampusVisitController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));

router.get("/", CollegeAdminCampusVisitController.list);
router.get("/stats", CollegeAdminCampusVisitController.getStats);
router.get("/availability", CollegeAdminCampusVisitController.listAvailability);
router.put(
  "/availability",
  CollegeAdminCampusVisitController.upsertAvailability,
);
router.get("/:visitId", CollegeAdminCampusVisitController.getOne);

export default router;
