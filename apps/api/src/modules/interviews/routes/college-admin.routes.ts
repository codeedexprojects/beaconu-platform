import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { InterviewCollegeAdminController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));
const view = authorize("interviews.view");
const manage = authorize("interviews.manage");

router.get("/bookings", view, InterviewCollegeAdminController.listBookings);
router.get("/bookings/:id", view, InterviewCollegeAdminController.getBooking);
router.patch(
  "/bookings/:id/complete",
  manage,
  InterviewCollegeAdminController.completeInterview,
);
router.patch(
  "/bookings/:id/cancel",
  manage,
  InterviewCollegeAdminController.cancel,
);

router.get(
  "/panel-availability",
  view,
  InterviewCollegeAdminController.getPanelAvailability,
);

router.get(
  "/applications/:applicationId",
  view,
  InterviewCollegeAdminController.getApplicationDetail,
);
router.patch(
  "/applications/:applicationId/schedule",
  manage,
  InterviewCollegeAdminController.schedule,
);

router.patch(
  "/courses/:applicationCourseId/shortlist",
  manage,
  InterviewCollegeAdminController.shortlist,
);

export default router;
