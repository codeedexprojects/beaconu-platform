import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { InstitutesOfNationalImportanceStudentController } from "../controllers/institutes-of-national-importance-student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.get("/", InstitutesOfNationalImportanceStudentController.list);

export default router;
