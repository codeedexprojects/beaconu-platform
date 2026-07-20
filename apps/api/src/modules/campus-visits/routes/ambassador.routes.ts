import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { AmbassadorCampusVisitController } from "../controllers/ambassador.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("blink_ambassador"));

router.get("/", AmbassadorCampusVisitController.list);
router.patch("/:visitId/accept", AmbassadorCampusVisitController.accept);
router.patch("/:visitId/reassign", AmbassadorCampusVisitController.reassign);

export default router;
