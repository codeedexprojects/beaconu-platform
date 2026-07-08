import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { StudentAdmissionCycleController } from "../controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.get("/", StudentAdmissionCycleController.list);
router.get("/:id", StudentAdmissionCycleController.getById);

export default router;
