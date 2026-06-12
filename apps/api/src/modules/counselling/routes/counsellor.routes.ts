import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import {
  authorizeUserType,
  authorizeCounsellorType,
} from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import { updateMyProfileSchema } from "../validators/counselling.validator";
import { CounsellorController } from "../controllers/counsellor.controller";
import {
  addSlotSchema,
  cancelSessionSchema,
  completeSessionSchema,
  listSessionsQuerySchema,
  listSlotsQuerySchema,
  listWalletTransactionsQuerySchema,
  rescheduleSessionSchema,
  sessionIdParamsSchema,
  updateMeetingSchema,
} from "../validators/sessions.validator";
import { CounsellorSessionController } from "../controllers/session.controller";

const router: Router = Router();

router.get(
  "/profile",
  authenticate,
  authorizeUserType("counsellor"),
  CounsellorController.getProfile,
);
router.patch(
  "/profile",
  authenticate,
  authorizeUserType("counsellor"),
  validate(updateMyProfileSchema),
  CounsellorController.updateProfile,
);

router.post(
  "/availability/slots",
  authenticate,
  authorizeUserType("counsellor"),
  validate(addSlotSchema),
  CounsellorSessionController.addSlot,
);

router.get(
  "/availability/slots",
  authenticate,
  authorizeUserType("counsellor"),
  validate(listSlotsQuerySchema, "query"),
  CounsellorSessionController.listMySlots,
);

router.get(
  "/sessions",
  authenticate,
  authorizeUserType("counsellor"),
  validate(listSessionsQuerySchema, "query"),
  CounsellorSessionController.listSessions,
);

router.get(
  "/sessions/:id",
  authenticate,
  authorizeUserType("counsellor"),
  validate(sessionIdParamsSchema, "params"),
  CounsellorSessionController.getSession,
);

router.patch(
  "/sessions/:id/cancel",
  authenticate,
  authorizeUserType("counsellor"),
  validate(sessionIdParamsSchema, "params"),
  validate(cancelSessionSchema),
  CounsellorSessionController.cancelSession,
);

router.patch(
  "/sessions/:id/reschedule",
  authenticate,
  authorizeUserType("counsellor"),
  validate(sessionIdParamsSchema, "params"),
  validate(rescheduleSessionSchema),
  CounsellorSessionController.rescheduleSession,
);

router.patch(
  "/sessions/:id/meeting",
  authenticate,
  authorizeUserType("counsellor"),
  validate(sessionIdParamsSchema, "params"),
  validate(updateMeetingSchema),
  CounsellorSessionController.updateMeeting,
);

router.patch(
  "/sessions/:id/complete",
  authenticate,
  authorizeUserType("counsellor"),
  validate(sessionIdParamsSchema, "params"),
  validate(completeSessionSchema),
  CounsellorSessionController.completeSession,
);

router.get(
  "/wallet",
  authenticate,
  authorizeUserType("counsellor"),
  authorizeCounsellorType("academic"),
  validate(listWalletTransactionsQuerySchema, "query"),
  CounsellorSessionController.getWallet,
);

export default router;
