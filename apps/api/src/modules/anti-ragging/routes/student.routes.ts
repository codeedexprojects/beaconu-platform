import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { StudentAntiRaggingController } from "../controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.post("/", StudentAntiRaggingController.create);
router.get("/", StudentAntiRaggingController.list);
router.get("/:complaintId", StudentAntiRaggingController.get);

export default router;
