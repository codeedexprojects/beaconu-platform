import { Router } from "express";

import platformAuthRoutes from "@/modules/auth/routes/platform-auth.routes";
import platformRolesRoutes from "@/modules/platform-admin/routes/platform-roles.routes";
import platformUsersRoutes from "@/modules/platform-admin/routes/platform-users.routes";
import counsellingAdminRoutes from "@/modules/counselling/routes/platform-admin.routes";
import adminUniversityRoutes from "@/modules/universities/routes/platform-admin.routes";
import collegeLeadsAdminRoutes from "@/modules/landing-page/routes/admin.routes";
import adminBlogRoutes from "@/modules/content/routes/platform-admin.routes";
import platformAdminCommunityRoutes from "@/modules/community/routes/platform-admin.routes";
import platformAdminMgmtRoutes from "@/modules/platform-admin/routes/platform-admin-mgmt.routes";
import platformPermissionsRoutes from "@/modules/platform-admin/routes/platform-permissions.routes";
import collegeDashboardRoutes from "@/modules/colleges/routes/college-dashboard.routes";
import { adminInstitutionGroupRouter } from "@/modules/colleges/routes/institution-group.routes";
import newsAlertsRoutes from "@/modules/platform-admin/routes/news-alerts.routes";
import entranceExamsRoutes from "@/modules/platform-admin/routes/entrance-exams.routes";
import financialAidLoansRoutes from "@/modules/platform-admin/routes/financial-aid-loans.routes";
import starterGuideVideosRoutes from "@/modules/platform-admin/routes/starter-guide-videos.routes";
import notificationsRoutes from "@/modules/notifications/routes/platform-admin.routes";
import platformAdminUploadRoutes from "@/modules/upload/routes/platform-admin.routes";
import eventAdminRoutes from "@/modules/events/routes/platform-admin.routes";

const router: Router = Router();

router.use("/auth", platformAuthRoutes);
router.use("/roles", platformRolesRoutes);
router.use("/permissions", platformPermissionsRoutes);
router.use("/users", platformUsersRoutes);
router.use("/counsellors", counsellingAdminRoutes);
router.use("/universities", adminUniversityRoutes);
router.use("/platform-admins", platformAdminMgmtRoutes);
router.use("/news", newsAlertsRoutes);
router.use("/entrance-exams", entranceExamsRoutes);
router.use("/financial-aid/loans", financialAidLoansRoutes);
router.use("/starter-guide/videos", starterGuideVideosRoutes);

router.use("/college-leads", collegeLeadsAdminRoutes);
router.use("/colleges", collegeDashboardRoutes);
router.use("/colleges/:id", adminInstitutionGroupRouter);
router.use("/blogs", adminBlogRoutes);
router.use("/communities", platformAdminCommunityRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/uploads", platformAdminUploadRoutes);
router.use("/events", eventAdminRoutes);

export default router;
