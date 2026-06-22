import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import {
  authorize,
  authorizeAny,
  authorizeUserType,
  denyRoleSlugs,
} from "@/shared/middleware/authorize";
import { CollegeFacilitiesController } from "../controllers/college-facilities.controller";

const router: Router = Router();

const staffAuth = [authenticate, authorizeUserType("staff_member")];
const staffWriteAuth = [...staffAuth, denyRoleSlugs("sub_admin")];

// ── Hostels ───────────────────────────────────────────────────────────────────
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
  "/hostels/:id",
  ...staffAuth,
  authorizeAny("hostel.view", "hostel.manage"),
  CollegeFacilitiesController.getHostelDetail,
);

router.patch(
  "/hostels/:id",
  ...staffWriteAuth,
  authorize("hostel.manage"),
  CollegeFacilitiesController.updateHostel,
);

router.post(
  "/hostels/:hostelId/room-types",
  ...staffWriteAuth,
  authorize("hostel.manage"),
  CollegeFacilitiesController.createRoomType,
);

router.patch(
  "/hostels/:hostelId/room-types/:id",
  ...staffWriteAuth,
  authorize("hostel.manage"),
  CollegeFacilitiesController.updateRoomType,
);

router.delete(
  "/hostels/:hostelId/room-types/:id",
  ...staffWriteAuth,
  authorize("hostel.manage"),
  CollegeFacilitiesController.deleteRoomType,
);

router.post(
  "/hostels/:hostelId/mess-plans",
  ...staffWriteAuth,
  authorize("hostel.manage"),
  CollegeFacilitiesController.createMessPlan,
);

router.patch(
  "/hostels/:hostelId/mess-plans/:id",
  ...staffWriteAuth,
  authorize("hostel.manage"),
  CollegeFacilitiesController.updateMessPlan,
);

router.delete(
  "/hostels/:hostelId/mess-plans/:id",
  ...staffWriteAuth,
  authorize("hostel.manage"),
  CollegeFacilitiesController.deleteMessPlan,
);

router.post(
  "/hostels/:hostelId/addon-services",
  ...staffWriteAuth,
  authorize("hostel.manage"),
  CollegeFacilitiesController.createAddonService,
);

router.patch(
  "/hostels/:hostelId/addon-services/:id",
  ...staffWriteAuth,
  authorize("hostel.manage"),
  CollegeFacilitiesController.updateAddonService,
);

router.delete(
  "/hostels/:hostelId/addon-services/:id",
  ...staffWriteAuth,
  authorize("hostel.manage"),
  CollegeFacilitiesController.deleteAddonService,
);

// ── Commute / Bus Fleet ───────────────────────────────────────────────────────
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
