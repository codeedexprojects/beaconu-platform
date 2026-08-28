import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { StudentCallRequestController } from "../controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.post("/", StudentCallRequestController.create);
router.get("/", StudentCallRequestController.list);
router.get("/:id", StudentCallRequestController.getById);
router.patch("/:id/cancel", StudentCallRequestController.cancel);

export default router;
