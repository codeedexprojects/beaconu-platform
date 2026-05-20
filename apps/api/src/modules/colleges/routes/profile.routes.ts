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
  "/profile",
  ...staffAuth,
  authorizeAny("profile.view", "profile.edit"),
  CollegeRegistrationController.getProfile,
);

router.patch(
  "/profile",
  ...staffWriteAuth,
  authorize("profile.edit"),
  CollegeRegistrationController.updateProfile,
);

router.get(
  "/check-subdomain/:slug",
  ...staffAuth,
  CollegeRegistrationController.checkSubdomain,
);

router.patch(
  "/subdomain",
  ...staffWriteAuth,
  authorize("profile.edit"),
  CollegeRegistrationController.setSubdomain,
);

router.patch(
  "/profile/finalize",
  ...staffWriteAuth,
  authorize("profile.edit"),
  CollegeRegistrationController.finalize,
);

router.post(
  "/profile/submit",
  ...staffWriteAuth,
  authorize("profile.edit"),
  CollegeRegistrationController.finalize,
);

export default router;
