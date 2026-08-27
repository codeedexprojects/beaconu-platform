import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminCallRequestController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));

router.get("/", CollegeAdminCallRequestController.list);
router.get("/:id", CollegeAdminCallRequestController.getById);
router.patch("/:id/status", CollegeAdminCallRequestController.updateStatus);

export default router;
