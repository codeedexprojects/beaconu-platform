import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { ApplicationsCollegeAdminController } from "../controllers/applications-college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));

router.get("/", ApplicationsCollegeAdminController.list);
router.get("/:id", ApplicationsCollegeAdminController.getById);

export default router;
