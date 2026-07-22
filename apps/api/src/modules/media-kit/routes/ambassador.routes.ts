import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { AmbassadorMediaKitController } from "../controllers/ambassador.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("blink_ambassador"));

router.get("/", AmbassadorMediaKitController.list);

export default router;
