import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import {
  registerAmbassadorSchema,
  collegeListQuerySchema,
} from "../validators/blink.validator";
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

router.get(
  "/colleges",
  authenticate,
  authorizeUserType("blink_ambassador"),
  validate(collegeListQuerySchema, "query"),
  AmbassadorController.listColleges,
);

router.get(
  "/colleges/:collegeId/courses",
  authenticate,
  authorizeUserType("blink_ambassador"),
  AmbassadorController.listCoursesByCollege,
);

router.get(
  "/colleges/:collegeId/courses/:courseId",
  authenticate,
  authorizeUserType("blink_ambassador"),
  AmbassadorController.getCourseDetail,
);

export default router;
