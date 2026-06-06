import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import {
  bookSessionSchema,
  cancelSessionSchema,
  listAvailableSlotsQuerySchema,
  listSlotsQuerySchema,
  rescheduleSessionSchema,
  sessionIdParamsSchema,
} from "../validators/sessions.validator";
import { StudentSessionController } from "../controllers/session.controller";

const router: Router = Router();

router.get(
  "/slots",
  authenticate,
  authorizeUserType("student"),
  validate(listAvailableSlotsQuerySchema, "query"),
  StudentSessionController.listAvailableSlots,
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
  validate(listSlotsQuerySchema, "query"),
  StudentSessionController.listSessions,
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

export default router;
