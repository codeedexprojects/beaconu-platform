import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { CommuteStudentController } from "../controllers/student.controller";
import { StudentPaymentController } from "@/modules/payments/controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.get("/routes", CommuteStudentController.listRoutes);
router.get("/routes/:routeId/stops", CommuteStudentController.listStops);
router.get("/routes/:routeId/buses", CommuteStudentController.listBuses);
router.get(
  "/routes/:routeId/schedule",
  CommuteStudentController.getRouteSchedule,
);

router.post("/enrollment", CommuteStudentController.setup);
router.patch("/enrollment", CommuteStudentController.modify);
router.get("/enrollment", CommuteStudentController.getDashboard);

router.get("/ride-history", CommuteStudentController.listRideHistory);

router.post(
  "/payments/initiate",
  StudentPaymentController.initiateCommutePayment,
);
router.post(
  "/payments/confirm",
  StudentPaymentController.confirmCommutePayment,
);
router.get("/payments", StudentPaymentController.listCommutePayments);

export default router;
