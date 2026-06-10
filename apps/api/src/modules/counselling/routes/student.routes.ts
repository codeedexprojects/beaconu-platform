import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import {
  bookSessionSchema,
  cancelSessionSchema,
  createPaymentOrderSchema,
  listAvailableSlotsQuerySchema,
  listCounsellorsQuerySchema,
  listSessionsQuerySchema,
  rescheduleSessionSchema,
  sessionIdParamsSchema,
  rateSessionSchema,
} from "../validators/sessions.validator";
import { StudentSessionController } from "../controllers/session.controller";

const router: Router = Router();

router.get(
  "/counsellors",
  authenticate,
  authorizeUserType("student"),
  validate(listCounsellorsQuerySchema, "query"),
  StudentSessionController.listCounsellors,
);

router.get(
  "/slots",
  authenticate,
  authorizeUserType("student"),
  validate(listAvailableSlotsQuerySchema, "query"),
  StudentSessionController.listAvailableSlots,
);

router.post(
  "/sessions/create-order",
  authenticate,
  authorizeUserType("student"),
  validate(createPaymentOrderSchema),
  StudentSessionController.createPaymentOrder,
);

router.post(
  "/sessions",
  authenticate,
  authorizeUserType("student"),
  validate(bookSessionSchema),
  StudentSessionController.bookSession,
);

router.get(
  "/sessions",
  authenticate,
  authorizeUserType("student"),
  validate(listSessionsQuerySchema, "query"),
  StudentSessionController.listSessions,
);

router.get(
  "/sessions/booked",
  authenticate,
  authorizeUserType("student"),
  validate(listSessionsQuerySchema, "query"),
  StudentSessionController.listBookedSessions,
);

router.get(
  "/sessions/completed",
  authenticate,
  authorizeUserType("student"),
  validate(listSessionsQuerySchema, "query"),
  StudentSessionController.listCompletedSessions,
);

router.get(
  "/sessions/:id",
  authenticate,
  authorizeUserType("student"),
  validate(sessionIdParamsSchema, "params"),
  StudentSessionController.getSession,
);

router.patch(
  "/sessions/:id/cancel",
  authenticate,
  authorizeUserType("student"),
  validate(sessionIdParamsSchema, "params"),
  validate(cancelSessionSchema),
  StudentSessionController.cancelSession,
);

router.patch(
  "/sessions/:id/reschedule",
  authenticate,
  authorizeUserType("student"),
  validate(sessionIdParamsSchema, "params"),
  validate(rescheduleSessionSchema),
  StudentSessionController.rescheduleSession,
);

router.post(
  "/sessions/:id/rate",
  authenticate,
  authorizeUserType("student"),
  validate(sessionIdParamsSchema, "params"),
  validate(rateSessionSchema),
  StudentSessionController.rateSession,
);

export default router;
