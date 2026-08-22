import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { ShortsStudentController } from "../controllers/shorts-student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.get("/", ShortsStudentController.listActive);

export default router;
