import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import {
  authorize,
  authorizeAny,
  authorizeUserType,
  denyRoleSlugs,
} from "@/shared/middleware/authorize";
import { SiteAnnouncementCollegeAdminController } from "../controllers/site-announcement-college-admin.controller";

const router: Router = Router();

const staffAuth = [authenticate, authorizeUserType("staff_member")];
const staffWriteAuth = [...staffAuth, denyRoleSlugs("sub_admin")];

router.get(
  "/announcements",
  ...staffAuth,
  authorizeAny("profile.view", "profile.edit"),
  SiteAnnouncementCollegeAdminController.list,
);

router.post(
  "/announcements",
  ...staffWriteAuth,
  authorize("profile.edit"),
  SiteAnnouncementCollegeAdminController.create,
);

router.patch(
  "/announcements/reorder",
  ...staffWriteAuth,
  authorize("profile.edit"),
  SiteAnnouncementCollegeAdminController.reorder,
);

router.patch(
  "/announcements/:id",
  ...staffWriteAuth,
  authorize("profile.edit"),
  SiteAnnouncementCollegeAdminController.update,
);

router.delete(
  "/announcements/:id",
  ...staffWriteAuth,
  authorize("profile.edit"),
  SiteAnnouncementCollegeAdminController.remove,
);

export default router;
