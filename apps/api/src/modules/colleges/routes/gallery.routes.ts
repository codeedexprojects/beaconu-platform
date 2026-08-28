import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import {
  authorize,
  authorizeAny,
  authorizeUserType,
  denyRoleSlugs,
} from "@/shared/middleware/authorize";
import { CollegeGalleryController } from "../controllers/college-gallery.controller";

const router: Router = Router();

const staffAuth = [authenticate, authorizeUserType("staff_member")];
const staffWriteAuth = [...staffAuth, denyRoleSlugs("sub_admin")];

router.get(
  "/gallery",
  ...staffAuth,
  authorizeAny("profile.view", "profile.edit"),
  CollegeGalleryController.list,
);

router.post(
  "/gallery",
  ...staffWriteAuth,
  authorize("profile.edit"),
  CollegeGalleryController.create,
);

router.patch(
  "/gallery/reorder",
  ...staffWriteAuth,
  authorize("profile.edit"),
  CollegeGalleryController.reorder,
);

router.delete(
  "/gallery/:id",
  ...staffWriteAuth,
  authorize("profile.edit"),
  CollegeGalleryController.remove,
);

export default router;
