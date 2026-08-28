import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminStudentsController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));
const view = authorize("students.view");

router.get("/", view, CollegeAdminStudentsController.listMinimal);
router.get("/enrolled", view, CollegeAdminStudentsController.listEnrolled);
router.get("/enrolled/:id", view, CollegeAdminStudentsController.getDetail);

export default router;
