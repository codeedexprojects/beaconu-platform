import { Router } from "express";

import profileRoutes from "./profile.routes";
import campusesRoutes from "./campuses.routes";
import coursesRoutes from "./courses.routes";
import staffRoutes from "./staff.routes";
import facilitiesRoutes from "./facilities.routes";

const router: Router = Router();

router.use("/", profileRoutes);
router.use("/campuses", campusesRoutes);
router.use("/courses", coursesRoutes);
router.use("/", staffRoutes);
router.use("/", facilitiesRoutes);

export default router;
