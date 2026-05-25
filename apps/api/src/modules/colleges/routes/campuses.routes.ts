import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import {
  authorize,
  authorizeAny,
  authorizeUserType,
  denyRoleSlugs,
} from "@/shared/middleware/authorize";
import { CollegeRegistrationController } from "../controllers/college-registration.controller";

const router: Router = Router();

const staffAuth = [authenticate, authorizeUserType("staff_member")];
const staffWriteAuth = [...staffAuth, denyRoleSlugs("sub_admin")];

router.get(
  "/",
  ...staffAuth,
  authorizeAny("campuses.view", "campuses.manage"),
  CollegeRegistrationController.listCampuses,
);

router.post(
  "/",
  ...staffWriteAuth,
  authorize("campuses.manage"),
  CollegeRegistrationController.addCampus,
);

router.patch(
  "/:id",
  ...staffWriteAuth,
  authorize("campuses.manage"),
  CollegeRegistrationController.updateCampus,
);

router.delete(
  "/:id",
  ...staffWriteAuth,
  authorize("campuses.manage"),
  CollegeRegistrationController.deleteCampus,
);

export default router;
