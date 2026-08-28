import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminCampusVisitController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));
const manage = authorize("campus-visits.manage");

router.get("/", manage, CollegeAdminCampusVisitController.list);
router.get("/stats", manage, CollegeAdminCampusVisitController.getStats);
router.get(
  "/availability",
  manage,
  CollegeAdminCampusVisitController.listAvailability,
);
router.put(
  "/availability",
  manage,
  CollegeAdminCampusVisitController.upsertAvailability,
);
router.get("/:visitId", manage, CollegeAdminCampusVisitController.getOne);

export default router;
