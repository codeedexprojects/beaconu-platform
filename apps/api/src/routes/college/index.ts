import { Router } from "express";

import staffAuthRoutes from "@/modules/auth/routes/staff-auth.routes";
import collegeAdminCommunityRoutes from "@/modules/community/routes/college-admin.routes";
import collegeAdminRoutes from "@/modules/colleges/routes/college-admin.routes";
import { collegeInstitutionGroupRouter } from "@/modules/colleges/routes/institution-group.routes";

const router: Router = Router();

router.use("/auth", staffAuthRoutes);
router.use("/", collegeAdminRoutes);
router.use("/communities", collegeAdminCommunityRoutes);
router.use("/institution-group", collegeInstitutionGroupRouter);

export default router;
