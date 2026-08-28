import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { InterviewCollegeAdminController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));
const view = authorize("interviews.view");
const manage = authorize("interviews.manage");

router.get("/settings", view, InterviewCollegeAdminController.getSettings);
router.patch(
  "/settings",
  manage,
  InterviewCollegeAdminController.updateSettings,
);

router.post("/slots", manage, InterviewCollegeAdminController.createSlot);
router.get("/slots", view, InterviewCollegeAdminController.listSlots);
router.patch("/slots/:id", manage, InterviewCollegeAdminController.updateSlot);
router.patch(
  "/slots/:id/cancel",
  manage,
  InterviewCollegeAdminController.cancelSlot,
);

router.get("/bookings", view, InterviewCollegeAdminController.listBookings);
router.patch(
  "/bookings/:id/complete",
  manage,
  InterviewCollegeAdminController.completeInterview,
);

router.get(
  "/reschedules",
  view,
  InterviewCollegeAdminController.listReschedules,
);
router.patch(
  "/reschedules/:id/review",
  manage,
  InterviewCollegeAdminController.reviewReschedule,
);

router.patch(
  "/courses/:applicationCourseId/shortlist",
  manage,
  InterviewCollegeAdminController.shortlist,
);

export default router;
