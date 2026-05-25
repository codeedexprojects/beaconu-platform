import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeRegistrationController } from "../controllers/college-registration.controller";

const router: Router = Router();

const staffAuth = [authenticate, authorizeUserType("staff_member")];

router.get("/streams", ...staffAuth, CollegeRegistrationController.getStreams);
router.get(
  "/study-levels",
  ...staffAuth,
  CollegeRegistrationController.getStudyLevels,
);
router.get(
  "/program-types",
  ...staffAuth,
  CollegeRegistrationController.getProgramTypes,
);
router.get(
  "/universities",
  ...staffAuth,
  CollegeRegistrationController.getUniversities,
);

export default router;
