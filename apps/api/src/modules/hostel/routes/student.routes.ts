import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { HostelStudentController } from "../controllers/student.controller";
import { StudentPaymentController } from "@/modules/payments/controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.post(
  "/hostels/booking/initiate",
  StudentPaymentController.initiateHostelBooking,
);
router.post(
  "/hostels/booking/confirm",
  StudentPaymentController.confirmHostelBooking,
);
router.get("/hostels/enrollment", HostelStudentController.getMyEnrollment);
router.get("/hostels/payments", StudentPaymentController.listHostelPayments);
router.get("/hostels", HostelStudentController.listHostels);
router.get("/hostels/:hostelId", HostelStudentController.getHostelDetail);

export default router;
