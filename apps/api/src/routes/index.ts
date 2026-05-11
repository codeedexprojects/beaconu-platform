import { Router } from "express";

// Auth — one route file per actor
import blinkAuthRoutes from "@/modules/auth/routes/blink-auth.routes";
import counsellorAuthRoutes from "@/modules/auth/routes/counsellor-auth.routes";
import platformAuthRoutes from "@/modules/auth/routes/platform-auth.routes";
import studentAuthRoutes from "@/modules/auth/routes/student-auth.routes";
import staffAuthRoutes from "@/modules/auth/routes/staff-auth.routes";

// Platform Admin
import platformRolesRoutes from "@/modules/platform-admin/routes/platform-roles.routes";
import platformUsersRoutes from "@/modules/platform-admin/routes/platform-users.routes";

// Blink
import blinkAssociateRoutes from "@/modules/blink/routes/associate.routes";
import blinkAmbassadorRoutes from "@/modules/blink/routes/ambassador.routes";

// Counselling
import counsellorRoutes from "@/modules/counselling/routes/counsellor.routes";
import counsellingAdminRoutes from "@/modules/counselling/routes/platform-admin.routes";

// Health
import healthRoutes from "@/modules/health/routes/health.routes";

const router: Router = Router();

// === Auth ===
router.use("/api/v1/blink/auth", blinkAuthRoutes);
router.use("/api/v1/counsellor/auth", counsellorAuthRoutes);
router.use("/api/v1/admin/auth", platformAuthRoutes);
router.use("/api/v1/student/auth", studentAuthRoutes);
router.use("/api/v1/college/auth", staffAuthRoutes);

// === Platform Admin ===
router.use("/api/v1/admin/roles", platformRolesRoutes);
router.use("/api/v1/admin/users", platformUsersRoutes);

// === Blink ===
router.use("/api/v1/blink/associate", blinkAssociateRoutes);
router.use("/api/v1/blink/ambassador", blinkAmbassadorRoutes);

// === Counselling ===
router.use("/api/v1/counsellor", counsellorRoutes);
router.use("/api/v1/admin/counsellors", counsellingAdminRoutes);

// === Health ===
router.use("/api/v1/health", healthRoutes);

export default router;
