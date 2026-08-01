import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { InterviewCollegeAdminController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));

router.get("/settings", InterviewCollegeAdminController.getSettings);
router.patch("/settings", InterviewCollegeAdminController.updateSettings);

router.post("/slots", InterviewCollegeAdminController.createSlot);
router.get("/slots", InterviewCollegeAdminController.listSlots);
router.patch("/slots/:id", InterviewCollegeAdminController.updateSlot);
router.patch("/slots/:id/cancel", InterviewCollegeAdminController.cancelSlot);

router.get("/bookings", InterviewCollegeAdminController.listBookings);
router.patch(
  "/bookings/:id/complete",
  InterviewCollegeAdminController.completeInterview,
);

router.get("/reschedules", InterviewCollegeAdminController.listReschedules);
router.patch(
  "/reschedules/:id/review",
  InterviewCollegeAdminController.reviewReschedule,
);

router.patch(
  "/courses/:applicationCourseId/shortlist",
  InterviewCollegeAdminController.shortlist,
);

export default router;
