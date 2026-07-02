import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { StudentCampusVisitController } from "../controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.post("/", StudentCampusVisitController.book);
router.get("/", StudentCampusVisitController.list);
router.get("/availability", StudentCampusVisitController.listAvailability);
router.get("/:visitId", StudentCampusVisitController.getOne);
router.patch("/:visitId/reschedule", StudentCampusVisitController.reschedule);
router.patch("/:visitId/cancel", StudentCampusVisitController.cancel);

export default router;
