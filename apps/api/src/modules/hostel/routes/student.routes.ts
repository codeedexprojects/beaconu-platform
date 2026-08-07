import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { HostelStudentController } from "../controllers/student.controller";
import { StudentPaymentController } from "@/modules/payments/controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.post(
  "/hostels/room-types/:roomTypeId/application-fee/initiate",
  StudentPaymentController.initiateHostelApplicationFee,
);
router.post(
  "/hostels/application-fee/confirm",
  StudentPaymentController.confirmHostelApplicationFee,
);
router.post(
  "/hostels/token-fee/initiate",
  StudentPaymentController.initiateHostelTokenFee,
);
router.post(
  "/hostels/token-fee/confirm",
  StudentPaymentController.confirmHostelTokenFee,
);
router.get("/hostels/enrollment", HostelStudentController.getMyEnrollment);
router.get("/hostels/payments", StudentPaymentController.listHostelPayments);
router.get("/hostels", HostelStudentController.listHostels);
router.get("/hostels/:hostelId", HostelStudentController.getHostelDetail);

export default router;
