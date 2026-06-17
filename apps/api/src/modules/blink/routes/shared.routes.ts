import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { validate } from "@/shared/middleware/validate";
import { collegeListQuerySchema } from "../validators/blink.validator";
import { AssociateEmployeeController } from "../controllers/associate-employee.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("blink_associate", "blink_employee"),
  validate(collegeListQuerySchema, "query"),
  AssociateEmployeeController.listColleges,
);

router.get(
  "/:collegeId/courses",
  authenticate,
  authorizeUserType("blink_associate", "blink_employee"),
  AssociateEmployeeController.listCoursesByCollege,
);

router.get(
  "/:collegeId/courses/:courseId",
  authenticate,
  authorizeUserType("blink_associate", "blink_employee"),
  AssociateEmployeeController.getCourseDetail,
);

export default router;
