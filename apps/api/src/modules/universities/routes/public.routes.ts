import { Router } from "express";
import { UniversityPublicController } from "../controllers/public.controller";

const router: Router = Router();

router.get("/types", UniversityPublicController.listTypes);
router.get("/streams", UniversityPublicController.listStreams);
router.get("/disciplines", UniversityPublicController.listDisciplines);
router.get("/study-levels", UniversityPublicController.listStudyLevels);
router.get("/program-types", UniversityPublicController.listProgramTypes);

router.get("/", UniversityPublicController.listAll);
router.get("/:id", UniversityPublicController.getById);

// Trigger reload
export default router;
