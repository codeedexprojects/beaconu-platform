import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { StudentPaymentController } from "../controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.post(
  "/applications/:applicationId/initiate",
  StudentPaymentController.initiateApplicationPayment,
);
router.post(
  "/applications/:applicationId/confirm",
  StudentPaymentController.confirmApplicationPayment,
);

router.post(
  "/courses/:applicationCourseId/token/initiate",
  StudentPaymentController.initiateTokenPayment,
);
router.post(
  "/courses/:applicationCourseId/token/confirm",
  StudentPaymentController.confirmTokenPayment,
);

export default router;
