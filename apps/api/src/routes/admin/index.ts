import { Router } from "express";

import platformAuthRoutes from "@/modules/auth/routes/platform-auth.routes";
import platformRolesRoutes from "@/modules/platform-admin/routes/platform-roles.routes";
import platformUsersRoutes from "@/modules/platform-admin/routes/platform-users.routes";
import counsellingAdminRoutes from "@/modules/counselling/routes/platform-admin.routes";
import adminUniversityRoutes from "@/modules/universities/routes/platform-admin.routes";
import collegeLeadsAdminRoutes from "@/modules/landing-page/routes/admin.routes";
import adminBlogRoutes from "@/modules/content/routes/platform-admin.routes";
import platformAdminMgmtRoutes from "@/modules/platform-admin/routes/platform-admin-mgmt.routes";
import platformPermissionsRoutes from "@/modules/platform-admin/routes/platform-permissions.routes";
import collegeDashboardRoutes from "@/modules/colleges/routes/college-dashboard.routes";

const router: Router = Router();

router.use("/auth", platformAuthRoutes);
router.use("/roles", platformRolesRoutes);
router.use("/permissions", platformPermissionsRoutes);
router.use("/users", platformUsersRoutes);
router.use("/counsellors", counsellingAdminRoutes);
router.use("/universities", adminUniversityRoutes);
router.use("/platform-admins", platformAdminMgmtRoutes);

router.use("/college-leads", collegeLeadsAdminRoutes);
router.use("/colleges", collegeDashboardRoutes);
router.use("/blogs", adminBlogRoutes);

export default router;
