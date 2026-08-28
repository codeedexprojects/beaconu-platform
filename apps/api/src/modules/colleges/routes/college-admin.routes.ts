import { Router } from "express";

import profileRoutes from "./profile.routes";
import campusesRoutes from "./campuses.routes";
import coursesRoutes from "./courses.routes";
import quotasRoutes from "./quotas.routes";
import staffRoutes from "./staff.routes";
import facilitiesRoutes from "./facilities.routes";
import lookupsRoutes from "./lookups.routes";
import galleryRoutes from "./gallery.routes";

const router: Router = Router();

router.use("/", profileRoutes);
router.use("/campuses", campusesRoutes);
router.use("/courses", coursesRoutes);
router.use("/quotas", quotasRoutes);
router.use("/lookups", lookupsRoutes);
router.use("/", staffRoutes);
router.use("/", facilitiesRoutes);
router.use("/", galleryRoutes);

export default router;
