import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { StudentApplicationController } from "../controllers/student.controller";

const router: Router = Router();

router.use(authenticate, authorizeUserType("student"));

router.get(
  "/available-courses",
  StudentApplicationController.listAvailableSwitchCourses,
);
router.post("/", StudentApplicationController.requestCourseSwitch);
router.get("/", StudentApplicationController.listMyCourseSwitchRequests);

export default router;
