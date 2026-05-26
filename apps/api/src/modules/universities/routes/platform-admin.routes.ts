import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorize, authorizeUserType } from "@/shared/middleware/authorize";
import { UniversityPlatformAdminController } from "../controllers/platform-admin.controller";

const router: Router = Router();

// ── Academic taxonomy ──────────────────────────────────────────────────────
router.get(
  "/streams",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("academic-masters.view"),
  UniversityPlatformAdminController.listStreams,
);

router.post(
  "/streams",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("academic-masters.manage"),
  UniversityPlatformAdminController.createStream,
);

router.patch(
  "/streams/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("academic-masters.manage"),
  UniversityPlatformAdminController.updateStream,
);

router.patch(
  "/streams/:id/disable",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("academic-masters.manage"),
  UniversityPlatformAdminController.disableStream,
);

router.delete(
  "/streams/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("academic-masters.manage"),
  UniversityPlatformAdminController.deleteStream,
);

router.get(
  "/disciplines",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("academic-masters.view"),
  UniversityPlatformAdminController.listDisciplines,
);

router.post(
  "/disciplines",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("academic-masters.manage"),
  UniversityPlatformAdminController.createDiscipline,
);

router.patch(
  "/disciplines/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("academic-masters.manage"),
  UniversityPlatformAdminController.updateDiscipline,
);

router.patch(
  "/disciplines/:id/disable",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("academic-masters.manage"),
  UniversityPlatformAdminController.disableDiscipline,
);

router.delete(
  "/disciplines/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("academic-masters.manage"),
  UniversityPlatformAdminController.deleteDiscipline,
);

router.get(
  "/study-levels",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("academic-masters.view"),
  UniversityPlatformAdminController.listStudyLevels,
);

router.post(
  "/study-levels",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("academic-masters.manage"),
  UniversityPlatformAdminController.createStudyLevel,
);

router.patch(
  "/study-levels/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("academic-masters.manage"),
  UniversityPlatformAdminController.updateStudyLevel,
);

router.patch(
  "/study-levels/:id/disable",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("academic-masters.manage"),
  UniversityPlatformAdminController.disableStudyLevel,
);

router.delete(
  "/study-levels/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("academic-masters.manage"),
  UniversityPlatformAdminController.deleteStudyLevel,
);

router.get(
  "/program-types",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("academic-masters.view"),
  UniversityPlatformAdminController.listProgramTypes,
);

router.post(
  "/program-types",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("academic-masters.manage"),
  UniversityPlatformAdminController.createProgramType,
);

router.patch(
  "/program-types/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("academic-masters.manage"),
  UniversityPlatformAdminController.updateProgramType,
);

router.patch(
  "/program-types/:id/disable",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("academic-masters.manage"),
  UniversityPlatformAdminController.disableProgramType,
);

router.delete(
  "/program-types/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("academic-masters.manage"),
  UniversityPlatformAdminController.deleteProgramType,
);

// ── University types ────────────────────────────────────────────────────────
router.get(
  "/types",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("university-types.view"),
  UniversityPlatformAdminController.listAllTypes,
);

router.get(
  "/types/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("university-types.view"),
  UniversityPlatformAdminController.getTypeById,
);

router.post(
  "/types",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("university-types.manage"),
  UniversityPlatformAdminController.createType,
);

router.patch(
  "/types/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("university-types.manage"),
  UniversityPlatformAdminController.updateType,
);

router.patch(
  "/types/:id/disable",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("university-types.manage"),
  UniversityPlatformAdminController.disableType,
);

router.delete(
  "/types/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("university-types.manage"),
  UniversityPlatformAdminController.deleteType,
);

// ── Universities ────────────────────────────────────────────────────────────
router.get(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("universities.view"),
  UniversityPlatformAdminController.listAll,
);

router.get(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("universities.view"),
  UniversityPlatformAdminController.getById,
);

router.post(
  "/",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("universities.manage"),
  UniversityPlatformAdminController.create,
);

router.patch(
  "/:id",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("universities.manage"),
  UniversityPlatformAdminController.update,
);

router.patch(
  "/:id/archive",
  authenticate,
  authorizeUserType("platform_admin"),
  authorize("universities.manage"),
  UniversityPlatformAdminController.archive,
);

export default router;
