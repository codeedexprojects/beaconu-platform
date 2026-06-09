import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import { registerAmbassadorSchema } from "../validators/blink.validator";
import { CollegeAdminBlinkController } from "../controllers/college-admin.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("staff_member"),
  CollegeAdminBlinkController.listAmbassadors,
);

router.post(
  "/",
  authenticate,
  authorizeUserType("staff_member"),
  validate(registerAmbassadorSchema),
  CollegeAdminBlinkController.createAmbassador,
);

export default router;
