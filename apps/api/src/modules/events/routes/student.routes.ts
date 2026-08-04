import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import {
  eventIdParamsSchema,
  eventSlugParamsSchema,
  listMyRecordingsQuerySchema,
  listMyRegistrationsQuerySchema,
  listUpcomingEventsQuerySchema,
  registerEventSchema,
} from "../validators/event.validator";
import { EventStudentController } from "../controllers/student.controller";

const router: Router = Router();

router.get(
  "/upcoming",
  validate(listUpcomingEventsQuerySchema, "query"),
  EventStudentController.listUpcoming,
);

router.get(
  "/registrations",
  validate(listMyRegistrationsQuerySchema, "query"),
  EventStudentController.listMyRegistrations,
);

router.get(
  "/recordings",
  validate(listMyRecordingsQuerySchema, "query"),
  EventStudentController.listMyRecordings,
);

router.get(
  "/slug/:slug",
  validate(eventSlugParamsSchema, "params"),
  EventStudentController.getBySlug,
);

router.get(
  "/:id",
  validate(eventIdParamsSchema, "params"),
  EventStudentController.getById,
);

router.post(
  "/:id/register",
  validate(eventIdParamsSchema, "params"),
  validate(registerEventSchema),
  EventStudentController.register,
);

router.patch(
  "/:id/cancel",
  validate(eventIdParamsSchema, "params"),
  EventStudentController.cancelRegistration,
);

export default router;
