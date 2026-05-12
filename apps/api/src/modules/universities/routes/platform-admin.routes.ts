import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { UniversityPlatformAdminController } from "../controllers/platform-admin.controller";

const router: Router = Router();

// ── University types ────────────────────────────────────────────────────────
router.get(
  "/types",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.listAllTypes,
);

router.get(
  "/types/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.getTypeById,
);

router.post(
  "/types",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.createType,
);

router.patch(
  "/types/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.updateType,
);

router.patch(
  "/types/:id/disable",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.disableType,
);

router.delete(
  "/types/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.deleteType,
);

// ── Universities ────────────────────────────────────────────────────────────
router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.listAll,
);

router.get(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.getById,
);

router.post(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.create,
);

router.patch(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.update,
);

router.patch(
  "/:id/archive",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.archive,
);

export default router;
