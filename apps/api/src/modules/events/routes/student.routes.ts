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

// List upcoming events
router.get(
  "/upcoming",
  validate(listUpcomingEventsQuerySchema, "query"),
  EventStudentController.listUpcoming,
);

// My registered events
router.get(
  "/registrations",
  validate(listMyRegistrationsQuerySchema, "query"),
  EventStudentController.listMyRegistrations,
);

// My event recordings
router.get(
  "/recordings",
  validate(listMyRecordingsQuerySchema, "query"),
  EventStudentController.listMyRecordings,
);

// Get event detail by slug
router.get(
  "/slug/:slug",
  validate(eventSlugParamsSchema, "params"),
  EventStudentController.getBySlug,
);

// Get event detail by ID
router.get(
  "/:id",
  validate(eventIdParamsSchema, "params"),
  EventStudentController.getById,
);

// Register for an event
router.post(
  "/:id/register",
  validate(eventIdParamsSchema, "params"),
  validate(registerEventSchema),
  EventStudentController.register,
);

// Cancel event registration
router.patch(
  "/:id/cancel",
  validate(eventIdParamsSchema, "params"),
  EventStudentController.cancelRegistration,
);

export default router;
