import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminCallRequestController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));
const manage = authorize("support.manage");

router.get("/", manage, CollegeAdminCallRequestController.list);
router.get("/:id", manage, CollegeAdminCallRequestController.getById);
router.patch(
  "/:id/status",
  manage,
  CollegeAdminCallRequestController.updateStatus,
);

export default router;
