import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import { registerAmbassadorSchema } from "../validators/blink.validator";
import { AmbassadorController } from "../controllers/ambassador.controller";

const router: Router = Router();

router.post(
  "/register",
  authenticate,
  authorizeUserType("staff_member"),
  validate(registerAmbassadorSchema),
  AmbassadorController.register,
);

export default router;
