import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import { registerAmbassadorSchema } from "../validators/blink.validator";
import { AmbassadorController } from "../controllers/ambassador.controller";

const router: Router = Router();

router.post(
  "/register",
  authenticate,
  authorizeUserType("staff_member"),
  authorize("staff.manage"),
  validate(registerAmbassadorSchema),
  AmbassadorController.register,
);

router.get(
  "/profile",
  authenticate,
  authorizeUserType("blink_ambassador"),
  AmbassadorController.getProfile,
);

router.patch(
  "/profile",
  authenticate,
  authorizeUserType("blink_ambassador"),
  AmbassadorController.updateProfile,
);

export default router;
