import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import {
  createEventSchema,
  updateEventSchema,
  updateEventStatusSchema,
  uploadRecordingSchema,
  listEventsQuerySchema,
  eventIdParamsSchema,
} from "../validators/event.validator";
import { EventPlatformAdminController } from "../controllers/platform-admin.controller";

const router: Router = Router();

// List all events (admin)
router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("events.view"),
  validate(listEventsQuerySchema, "query"),
  EventPlatformAdminController.listAll,
);

// Create event
router.post(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("events.manage"),
  validate(createEventSchema),
  EventPlatformAdminController.create,
);

// Get event detail
router.get(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("events.view"),
  validate(eventIdParamsSchema, "params"),
  EventPlatformAdminController.getById,
);

// Update event
router.patch(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("events.manage"),
  validate(eventIdParamsSchema, "params"),
  validate(updateEventSchema),
  EventPlatformAdminController.update,
);

// Update event status (publish, cancel, complete, archive)
router.patch(
  "/:id/status",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("events.manage"),
  validate(eventIdParamsSchema, "params"),
  validate(updateEventStatusSchema),
  EventPlatformAdminController.updateStatus,
);

// Soft delete (archive) event
router.delete(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("events.manage"),
  validate(eventIdParamsSchema, "params"),
  EventPlatformAdminController.softDelete,
);

// Upload recording for completed event
router.patch(
  "/:id/recording",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("events.manage"),
  validate(eventIdParamsSchema, "params"),
  validate(uploadRecordingSchema),
  EventPlatformAdminController.uploadRecording,
);

// List registrations for an event
router.get(
  "/:id/registrations",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("events.view"),
  validate(eventIdParamsSchema, "params"),
  EventPlatformAdminController.listRegistrations,
);

export default router;
