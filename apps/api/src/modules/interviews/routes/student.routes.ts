import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { InterviewStudentController } from "../controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.get(
  "/bookings/application/:applicationId",
  InterviewStudentController.getMyBooking,
);

export default router;
