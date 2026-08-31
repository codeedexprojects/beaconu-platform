import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { ApplicationsCollegeAdminController } from "../controllers/applications-college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));
const view = authorize("admissions.view");
const manage = authorize("admissions.manage");

router.get("/", view, ApplicationsCollegeAdminController.list);
router.get(
  "/pending-enrollment",
  view,
  ApplicationsCollegeAdminController.listPendingEnrollment,
);
router.get("/:id", view, ApplicationsCollegeAdminController.getById);
router.post(
  "/courses/:applicationCourseId/enroll",
  manage,
  ApplicationsCollegeAdminController.enrollCourse,
);
router.patch(
  "/courses/:applicationCourseId/reject",
  manage,
  ApplicationsCollegeAdminController.rejectCourse,
);

export default router;
