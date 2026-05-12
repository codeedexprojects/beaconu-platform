import { Router } from "express";

import platformAuthRoutes from "@/modules/auth/routes/platform-auth.routes";
import platformRolesRoutes from "@/modules/platform-admin/routes/platform-roles.routes";
import platformUsersRoutes from "@/modules/platform-admin/routes/platform-users.routes";
import counsellingAdminRoutes from "@/modules/counselling/routes/platform-admin.routes";
import universityTypesPlatformAdminRoutes from "@/modules/universities/routes/university-types.routes";

const router: Router = Router();

router.use("/auth", platformAuthRoutes);
router.use("/roles", platformRolesRoutes);
router.use("/users", platformUsersRoutes);
router.use("/counsellors", counsellingAdminRoutes);
router.use("/university-types", universityTypesPlatformAdminRoutes);

export default router;
