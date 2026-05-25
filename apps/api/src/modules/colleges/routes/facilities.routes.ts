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
