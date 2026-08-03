import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { ScholarshipStudentController } from "../controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.get("/configs", ScholarshipStudentController.listConfigs);

router.post("/applications", ScholarshipStudentController.apply);
router.get("/applications", ScholarshipStudentController.listMine);
router.get("/applications/:id", ScholarshipStudentController.getMine);

export default router;
