import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminAntiRaggingController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));

router.get("/", CollegeAdminAntiRaggingController.list);
router.get("/:complaintId", CollegeAdminAntiRaggingController.get);
router.patch(
  "/:complaintId/acknowledge",
  CollegeAdminAntiRaggingController.acknowledge,
);
router.patch(
  "/:complaintId/start-investigation",
  CollegeAdminAntiRaggingController.startInvestigation,
);
router.patch(
  "/:complaintId/resolve",
  CollegeAdminAntiRaggingController.resolve,
);

export default router;
