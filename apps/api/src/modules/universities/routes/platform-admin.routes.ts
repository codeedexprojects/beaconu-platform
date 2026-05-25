import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { UniversityPlatformAdminController } from "../controllers/platform-admin.controller";

const router: Router = Router();

// force reload 2

// ── Academic taxonomy ──────────────────────────────────────────────────────
router.get(
  "/streams",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.listStreams,
);

router.post(
  "/streams",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.createStream,
);

router.patch(
  "/streams/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.updateStream,
);

router.patch(
  "/streams/:id/disable",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.disableStream,
);

router.delete(
  "/streams/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.deleteStream,
);

router.get(
  "/disciplines",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.listDisciplines,
);

router.post(
  "/disciplines",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.createDiscipline,
);

router.patch(
  "/disciplines/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.updateDiscipline,
);

router.patch(
  "/disciplines/:id/disable",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.disableDiscipline,
);

router.delete(
  "/disciplines/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.deleteDiscipline,
);

router.get(
  "/study-levels",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.listStudyLevels,
);

router.post(
  "/study-levels",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.createStudyLevel,
);

router.patch(
  "/study-levels/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.updateStudyLevel,
);

router.patch(
  "/study-levels/:id/disable",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.disableStudyLevel,
);

router.delete(
  "/study-levels/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.deleteStudyLevel,
);

router.get(
  "/program-types",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.listProgramTypes,
);

router.post(
  "/program-types",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.createProgramType,
);

router.patch(
  "/program-types/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.updateProgramType,
);

router.patch(
  "/program-types/:id/disable",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.disableProgramType,
);

router.delete(
  "/program-types/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  UniversityPlatformAdminController.deleteProgramType,
);

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
