import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { InstitutionGroupController } from "../controllers/institution-group.controller";

// ── Admin routes (mounted under /api/v1/admin/colleges/:id/) ──────────────

export const adminInstitutionGroupRouter: Router = Router({
  mergeParams: true,
});

const adminAuth = [authenticate, authorizeUserType("platform_admin")];

adminInstitutionGroupRouter.get(
  "/group",
  ...adminAuth,
  InstitutionGroupController.getGroupForCollege,
);

adminInstitutionGroupRouter.post(
  "/group/enable",
  ...adminAuth,
  InstitutionGroupController.enableGroup,
);

adminInstitutionGroupRouter.post(
  "/group/disable",
  ...adminAuth,
  InstitutionGroupController.disableGroup,
);

// ── College staff routes (mounted under /api/v1/college/) ─────────────────

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
  InstitutionGroupController.joinGroup,
);
