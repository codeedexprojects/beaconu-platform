import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeAdminAssessmentController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("staff_member"));

router.get("/sections", CollegeAdminAssessmentController.listSections);
router.patch(
  "/sections/:slug/toggle",
  CollegeAdminAssessmentController.toggleSection,
);
router.get(
  "/sections/:slug/question-types",
  CollegeAdminAssessmentController.listQuestionTypes,
);
router.get(
  "/sections/:slug/questions",
  CollegeAdminAssessmentController.listQuestions,
);
router.post(
  "/sections/:slug/questions",
  CollegeAdminAssessmentController.createQuestion,
);
router.patch("/questions/:id", CollegeAdminAssessmentController.updateQuestion);
router.delete(
  "/questions/:id",
  CollegeAdminAssessmentController.deleteQuestion,
);

router.get("/templates", CollegeAdminAssessmentController.listTemplates);
router.get("/templates/:id", CollegeAdminAssessmentController.getTemplate);
router.post("/templates", CollegeAdminAssessmentController.createTemplate);
router.patch("/templates/:id", CollegeAdminAssessmentController.updateTemplate);
router.patch(
  "/templates/:id/activate",
  CollegeAdminAssessmentController.activateTemplate,
);
router.patch(
  "/templates/:id/archive",
  CollegeAdminAssessmentController.archiveTemplate,
);

router.post(
  "/templates/:templateId/papers",
  CollegeAdminAssessmentController.generatePaper,
);
router.get(
  "/templates/:templateId/papers",
  CollegeAdminAssessmentController.listPapers,
);
router.get("/papers/:id", CollegeAdminAssessmentController.getPaper);
router.patch(
  "/papers/:id/approve",
  CollegeAdminAssessmentController.approvePaper,
);
router.delete("/papers/:id", CollegeAdminAssessmentController.deletePaper);

router.get(
  "/templates/:templateId/slots",
  CollegeAdminAssessmentController.listSlots,
);
router.post(
  "/templates/:templateId/slots",
  CollegeAdminAssessmentController.createSlot,
);
router.patch("/slots/:id", CollegeAdminAssessmentController.updateSlot);
router.patch("/slots/:id/cancel", CollegeAdminAssessmentController.cancelSlot);

export default router;
