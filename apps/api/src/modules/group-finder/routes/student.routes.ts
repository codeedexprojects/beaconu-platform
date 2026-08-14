import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { GroupFinderStudentController } from "../controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.get("/study-levels", GroupFinderStudentController.getStudyLevels);
router.get("/streams", GroupFinderStudentController.getStreams);
router.post("/match", GroupFinderStudentController.match);

export default router;
