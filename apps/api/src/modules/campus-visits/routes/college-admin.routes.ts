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
router.get("/settings", manage, CollegeAdminCampusVisitController.getSettings);
router.put(
  "/settings",
  manage,
  CollegeAdminCampusVisitController.upsertSettings,
);
router.get("/calendar", manage, CollegeAdminCampusVisitController.getCalendar);
router.post(
  "/date-overrides",
  manage,
  CollegeAdminCampusVisitController.addDateOverride,
);
router.delete(
  "/date-overrides/:overrideId",
  manage,
  CollegeAdminCampusVisitController.removeDateOverride,
);
router.post(
  "/cancel-date",
  manage,
  CollegeAdminCampusVisitController.cancelForDate,
);
router.get("/:visitId", manage, CollegeAdminCampusVisitController.getOne);
router.patch(
  "/:visitId/cancel",
  manage,
  CollegeAdminCampusVisitController.cancelVisit,
);

export default router;
