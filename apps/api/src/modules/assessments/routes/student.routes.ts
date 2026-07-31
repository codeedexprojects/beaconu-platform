import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { StudentAssessmentController } from "../controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

// No slot id — resolved server-side from the student's own application
// (admission cycle -> assessment template -> current active slot).
router.get("/start", StudentAssessmentController.getStartInfo);

router.get(
  "/templates/:templateId/trial",
  StudentAssessmentController.getTrialPaper,
);
router.post(
  "/templates/:templateId/trial/submit",
  StudentAssessmentController.submitTrial,
);

// Creates the attempt AND starts the clock in one call — no separate
// "begin" step (there's no screen between attempt-creation and the timer
// running in the real take-test flow).
router.post("/attempts", StudentAssessmentController.startAttempt);
router.get("/attempts/:id", StudentAssessmentController.getMyAttempt);
router.get(
  "/attempts/:id/sections",
  StudentAssessmentController.getAttemptSections,
);
router.get(
  "/attempts/:id/sections/:sectionId/questions",
  StudentAssessmentController.getSectionQuestions,
);
router.get("/attempts/:id/overview", StudentAssessmentController.getOverview);
router.patch(
  "/attempts/:id/answers/:questionId",
  StudentAssessmentController.saveAnswer,
);
router.post(
  "/attempts/:id/anti-cheat-events",
  StudentAssessmentController.recordAntiCheatEvent,
);
router.post("/attempts/:id/submit", StudentAssessmentController.submitAttempt);

export default router;
