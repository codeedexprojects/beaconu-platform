import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { AssociateMediaKitController } from "../controllers/associate.controller";

const router: Router = Router();

router.use(
  authenticate,
  authorizeUserType("blink_associate", "blink_employee"),
);

router.get("/", AssociateMediaKitController.list);

export default router;
