import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import {
  authorize,
  authorizeAny,
  authorizeUserType,
  denyRoleSlugs,
} from "@/shared/middleware/authorize";
import { CollegeRegistrationController } from "../controllers/college-registration.controller";
import { CollegeRolesController } from "../controllers/college-roles.controller";
import { CollegeFacilitiesController } from "../controllers/college-facilities.controller";

const router: Router = Router();

const staffAuth = [authenticate, authorizeUserType("staff_member")];
const staffWriteAuth = [...staffAuth, denyRoleSlugs("sub_admin")];

// ── Profile ──────────────────────────────────────────────────────────────────
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

// ── Campuses ─────────────────────────────────────────────────────────────────
router.get(
  "/campuses",
  ...staffAuth,
  authorizeAny("campuses.view", "campuses.manage"),
  CollegeRegistrationController.listCampuses,
);
router.post(
  "/campuses",
  ...staffWriteAuth,
  authorize("campuses.manage"),
  CollegeRegistrationController.addCampus,
);
router.patch(
  "/campuses/:id",
  ...staffWriteAuth,
  authorize("campuses.manage"),
  CollegeRegistrationController.updateCampus,
);
router.delete(
  "/campuses/:id",
  ...staffWriteAuth,
  authorize("campuses.manage"),
  CollegeRegistrationController.deleteCampus,
);

// ── Courses ───────────────────────────────────────────────────────────────────
router.get(
  "/courses",
  ...staffAuth,
  authorizeAny("academics.view", "academics.manage"),
  CollegeRegistrationController.listCourses,
);
router.post(
  "/courses",
  ...staffWriteAuth,
  authorize("academics.manage"),
  CollegeRegistrationController.addCourse,
);
router.patch(
  "/courses/:id",
  ...staffWriteAuth,
  authorize("academics.manage"),
  CollegeRegistrationController.updateCourse,
);
router.delete(
  "/courses/:id",
  ...staffWriteAuth,
  authorize("academics.manage"),
  CollegeRegistrationController.deleteCourse,
);

// ── Lookups (auth required for convenience, data is not sensitive) ─────────────
router.get(
  "/lookups/streams",
  ...staffAuth,
  CollegeRegistrationController.getStreams,
);
router.get(
  "/lookups/study-levels",
  ...staffAuth,
  CollegeRegistrationController.getStudyLevels,
);
router.get(
  "/lookups/program-types",
  ...staffAuth,
  CollegeRegistrationController.getProgramTypes,
);
router.get(
  "/lookups/universities",
  ...staffAuth,
  CollegeRegistrationController.getUniversities,
);

// ── Roles & Staff Directory ───────────────────────────────────────────────────
router.get(
  "/permissions",
  ...staffAuth,
  authorizeAny("staff.view", "staff.manage"),
  CollegeRolesController.listPermissions,
);
router.get(
  "/roles",
  ...staffAuth,
  authorizeAny("staff.view", "staff.manage"),
  CollegeRolesController.listRoles,
);
router.post(
  "/roles",
  ...staffWriteAuth,
  authorize("staff.manage"),
  CollegeRolesController.createRole,
);
router.patch(
  "/roles/:id",
  ...staffWriteAuth,
  authorize("staff.manage"),
  CollegeRolesController.updateRole,
);
router.delete(
  "/roles/:id",
  ...staffWriteAuth,
  authorize("staff.manage"),
  CollegeRolesController.deleteRole,
);

router.get(
  "/staff",
  ...staffAuth,
  authorizeAny("staff.view", "staff.manage"),
  CollegeRolesController.listStaff,
);
router.post(
  "/staff",
  ...staffWriteAuth,
  authorize("staff.manage"),
  CollegeRolesController.inviteStaff,
);
router.patch(
  "/staff/:id",
  ...staffWriteAuth,
  authorize("staff.manage"),
  CollegeRolesController.updateStaff,
);

// ── Hostels & Commutes Facilities ──
router.get(
  "/hostels",
  ...staffAuth,
  authorizeAny("hostel.view", "hostel.manage"),
  CollegeFacilitiesController.listHostels,
);
router.post(
  "/hostels",
  ...staffWriteAuth,
  authorize("hostel.manage"),
  CollegeFacilitiesController.createHostel,
);
router.delete(
  "/hostels/:id",
  ...staffWriteAuth,
  authorize("hostel.manage"),
  CollegeFacilitiesController.deleteHostel,
);

router.get(
  "/commute",
  ...staffAuth,
  authorizeAny("commute.view", "commute.manage"),
  CollegeFacilitiesController.listRoutes,
);
router.post(
  "/commute",
  ...staffWriteAuth,
  authorize("commute.manage"),
  CollegeFacilitiesController.createRoute,
);
router.delete(
  "/commute/:id",
  ...staffWriteAuth,
  authorize("commute.manage"),
  CollegeFacilitiesController.deleteRoute,
);

export default router;
