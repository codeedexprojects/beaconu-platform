import { Router } from "express";

import staffAuthRoutes from "@/modules/auth/routes/staff-auth.routes";
import collegeAdminCommunityRoutes from "@/modules/community/routes/college-admin.routes";
import collegeAdminRoutes from "@/modules/colleges/routes/college-admin.routes";
import { collegeInstitutionGroupRouter } from "@/modules/colleges/routes/institution-group.routes";
import collegeAdminBlinkRoutes from "@/modules/blink/routes/college-admin.routes";
import collegeAdminUploadRoutes from "@/modules/upload/routes/college-admin.routes";
import collegeAdminCampusVisitRoutes from "@/modules/campus-visits/routes/college-admin.routes";
import collegeAdminDocumentsRoutes from "@/modules/documents/routes/college-admin.routes";
import collegeAdminAntiRaggingRoutes from "@/modules/anti-ragging/routes/college-admin.routes";

const router: Router = Router();

router.use("/auth", staffAuthRoutes);
router.use("/", collegeAdminRoutes);
router.use("/communities", collegeAdminCommunityRoutes);
router.use("/institution-group", collegeInstitutionGroupRouter);
router.use("/ambassadors", collegeAdminBlinkRoutes);
router.use("/uploads", collegeAdminUploadRoutes);
router.use("/campus-visits", collegeAdminCampusVisitRoutes);
router.use("/documents", collegeAdminDocumentsRoutes);
router.use("/anti-ragging-complaints", collegeAdminAntiRaggingRoutes);

export default router;
