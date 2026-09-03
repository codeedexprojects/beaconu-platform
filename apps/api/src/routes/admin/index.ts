import { Router } from "express";

import platformAuthRoutes from "@/modules/auth/routes/platform-auth.routes";
import platformRolesRoutes from "@/modules/platform-admin/routes/platform-roles.routes";
import platformUsersRoutes from "@/modules/platform-admin/routes/platform-users.routes";
import counsellingAdminRoutes from "@/modules/counselling/routes/platform-admin.routes";
import blinkAdminRoutes from "@/modules/blink/routes/platform-admin.routes";
import counsellorRequestAdminRoutes from "@/modules/counselling/routes/counsellor-request.routes";
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
import educationBoardsRoutes from "@/modules/platform-admin/routes/education-boards.routes";
import institutesOfNationalImportanceRoutes from "@/modules/platform-admin/routes/institutes-of-national-importance.routes";
import studentsPlatformAdminRoutes from "@/modules/students/routes/platform-admin.routes";
import iconsRoutes from "@/modules/platform-admin/routes/icons.routes";
import financialAidLoansRoutes from "@/modules/platform-admin/routes/financial-aid-loans.routes";
import starterGuideRoutes from "@/modules/platform-admin/routes/starter-guide.routes";
import shortsRoutes from "@/modules/platform-admin/routes/shorts.routes";
import feedRoutes from "@/modules/platform-admin/routes/feed.routes";
import videoTestimonialsRoutes from "@/modules/platform-admin/routes/video-testimonials.routes";
import collegeTicketsRoutes from "@/modules/support/routes/platform-ticket-super-admin.routes";
import notificationsRoutes from "@/modules/notifications/routes/platform-admin.routes";
import platformAdminUploadRoutes from "@/modules/upload/routes/platform-admin.routes";
import eventAdminRoutes from "@/modules/events/routes/platform-admin.routes";
import platformConfigRoutes from "@/modules/platform-config/routes/platform-admin.routes";

const router: Router = Router();

router.use("/auth", platformAuthRoutes);
router.use("/roles", platformRolesRoutes);
router.use("/permissions", platformPermissionsRoutes);
router.use("/users", platformUsersRoutes);
router.use("/counsellors", counsellingAdminRoutes);
router.use("/blink", blinkAdminRoutes);
router.use("/counsellor-requests", counsellorRequestAdminRoutes);
router.use("/universities", adminUniversityRoutes);
router.use("/platform-admins", platformAdminMgmtRoutes);
router.use("/news", newsAlertsRoutes);
router.use("/entrance-exams", entranceExamsRoutes);
router.use("/education-boards", educationBoardsRoutes);
router.use(
  "/institutes-of-national-importance",
  institutesOfNationalImportanceRoutes,
);
router.use("/students", studentsPlatformAdminRoutes);
router.use("/icons", iconsRoutes);
router.use("/financial-aid/loans", financialAidLoansRoutes);
router.use("/starter-guide", starterGuideRoutes);
router.use("/shorts", shortsRoutes);
router.use("/feed", feedRoutes);
router.use("/video-testimonials", videoTestimonialsRoutes);
router.use("/college-tickets", collegeTicketsRoutes);

router.use("/college-leads", collegeLeadsAdminRoutes);
router.use("/colleges", collegeDashboardRoutes);
router.use("/colleges/:id", adminInstitutionGroupRouter);
router.use("/blogs", adminBlogRoutes);
router.use("/communities", platformAdminCommunityRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/uploads", platformAdminUploadRoutes);
router.use("/events", eventAdminRoutes);
router.use("/config", platformConfigRoutes);

export default router;
