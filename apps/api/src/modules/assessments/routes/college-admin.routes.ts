import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminAssessmentController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));
const view = authorize("assessments.view");
const manage = authorize("assessments.manage");
const evaluate = authorize("evaluation.manage");

router.get("/sections", view, CollegeAdminAssessmentController.listSections);
router.patch(
  "/sections/:slug/toggle",
  manage,
  CollegeAdminAssessmentController.toggleSection,
);
router.get(
  "/sections/:slug/question-types",
  view,
  CollegeAdminAssessmentController.listQuestionTypes,
);
router.get(
  "/sections/:slug/questions",
  view,
  CollegeAdminAssessmentController.listQuestions,
);
router.post(
  "/sections/:slug/questions",
  manage,
  CollegeAdminAssessmentController.createQuestion,
);
router.patch(
  "/questions/:id",
  manage,
  CollegeAdminAssessmentController.updateQuestion,
);
router.delete(
  "/questions/:id",
  manage,
  CollegeAdminAssessmentController.deleteQuestion,
);

router.get("/templates", view, CollegeAdminAssessmentController.listTemplates);
router.get(
  "/templates/:id",
  view,
  CollegeAdminAssessmentController.getTemplate,
);
router.post(
  "/templates",
  manage,
  CollegeAdminAssessmentController.createTemplate,
);
router.patch(
  "/templates/:id",
  manage,
  CollegeAdminAssessmentController.updateTemplate,
);
router.patch(
  "/templates/:id/activate",
  manage,
  CollegeAdminAssessmentController.activateTemplate,
);
router.patch(
  "/templates/:id/archive",
  manage,
  CollegeAdminAssessmentController.archiveTemplate,
);

router.post(
  "/templates/:templateId/papers",
  manage,
  CollegeAdminAssessmentController.generatePaper,
);
router.get(
  "/templates/:templateId/papers",
  view,
  CollegeAdminAssessmentController.listPapers,
);
router.get("/papers/:id", view, CollegeAdminAssessmentController.getPaper);
router.patch(
  "/papers/:id/approve",
  manage,
  CollegeAdminAssessmentController.approvePaper,
);
router.patch(
  "/papers/:id/rename",
  manage,
  CollegeAdminAssessmentController.renamePaper,
);
router.delete(
  "/papers/:id",
  manage,
  CollegeAdminAssessmentController.deletePaper,
);

router.get(
  "/templates/:templateId/slots",
  view,
  CollegeAdminAssessmentController.listSlots,
);
router.post(
  "/templates/:templateId/slots",
  manage,
  CollegeAdminAssessmentController.createSlot,
);
router.patch("/slots/:id", manage, CollegeAdminAssessmentController.updateSlot);
router.patch(
  "/slots/:id/toggle",
  manage,
  CollegeAdminAssessmentController.toggleSlot,
);

router.get(
  "/applications/:applicationId",
  view,
  CollegeAdminAssessmentController.getApplicationAssessmentStatus,
);

router.get(
  "/evaluation-queue",
  evaluate,
  CollegeAdminAssessmentController.listEvaluationQueue,
);
router.get(
  "/evaluation/:attemptId",
  evaluate,
  CollegeAdminAssessmentController.getEvaluationDetail,
);
router.patch(
  "/answers/:id/score",
  evaluate,
  CollegeAdminAssessmentController.scoreAnswer,
);
router.patch(
  "/attempts/:id/publish",
  evaluate,
  CollegeAdminAssessmentController.publishResult,
);
router.patch(
  "/attempts/:id/restart",
  evaluate,
  CollegeAdminAssessmentController.restartAttempt,
);

export default router;
