import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { StudentApplicationController } from "../controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.post("/", StudentApplicationController.requestSeatCancellation);
router.get("/", StudentApplicationController.listMySeatCancellations);

export default router;
