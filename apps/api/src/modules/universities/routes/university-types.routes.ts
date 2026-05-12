import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { UniversityTypePlatformAdminController } from "../controllers/platformAdmin.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityTypePlatformAdminController.listAll,
);

router.get(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityTypePlatformAdminController.getById,
);

router.post(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityTypePlatformAdminController.create,
);

router.patch(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityTypePlatformAdminController.update,
);

router.patch(
  "/:id/disable",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityTypePlatformAdminController.disable,
);

router.delete(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityTypePlatformAdminController.remove,
);

export default router;
