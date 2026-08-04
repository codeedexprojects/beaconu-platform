import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { InstitutionGroupController } from "../controllers/institution-group.controller";

export const adminInstitutionGroupRouter: Router = Router({
  mergeParams: true,
});

const adminAuth = [authenticate, authorizeUserType("platform_admin")];

adminInstitutionGroupRouter.get(
  "/group",
  ...adminAuth,
  authorize("colleges.view"),
  InstitutionGroupController.getGroupForCollege,
);

adminInstitutionGroupRouter.post(
  "/group/enable",
  ...adminAuth,
  authorize("colleges.manage"),
  InstitutionGroupController.enableGroup,
);

adminInstitutionGroupRouter.post(
  "/group/disable",
  ...adminAuth,
  authorize("colleges.manage"),
  InstitutionGroupController.disableGroup,
);

export const collegeInstitutionGroupRouter: Router = Router();

const staffAuth = [authenticate, authorizeUserType("staff_member")];

collegeInstitutionGroupRouter.get(
  "/",
  ...staffAuth,
  InstitutionGroupController.getMyGroup,
);

collegeInstitutionGroupRouter.post(
  "/join",
  ...staffAuth,
  authorize("profile.edit"),
  InstitutionGroupController.joinGroup,
);
