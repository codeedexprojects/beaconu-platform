import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminAntiRaggingController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));
const view = authorize("documents.view");
const manage = authorize("documents.manage");

router.get("/", view, CollegeAdminAntiRaggingController.list);
router.get("/:complaintId", view, CollegeAdminAntiRaggingController.get);
router.patch(
  "/:complaintId/acknowledge",
  manage,
  CollegeAdminAntiRaggingController.acknowledge,
);
router.patch(
  "/:complaintId/start-investigation",
  manage,
  CollegeAdminAntiRaggingController.startInvestigation,
);
router.patch(
  "/:complaintId/resolve",
  manage,
  CollegeAdminAntiRaggingController.resolve,
);

export default router;
