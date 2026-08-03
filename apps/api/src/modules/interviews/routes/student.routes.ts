import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { InterviewStudentController } from "../controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.get("/slots", InterviewStudentController.listAvailableSlots);
router.post("/bookings", InterviewStudentController.bookSlot);
router.get(
  "/bookings/application/:applicationId",
  InterviewStudentController.getMyBooking,
);
router.patch(
  "/bookings/:id/cancel",
  InterviewStudentController.cancelMyBooking,
);
router.post(
  "/bookings/:id/reschedule-requests",
  InterviewStudentController.requestReschedule,
);

export default router;
