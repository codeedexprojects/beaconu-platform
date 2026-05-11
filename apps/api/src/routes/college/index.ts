import { Router } from "express";

import staffAuthRoutes from "@/modules/auth/routes/staff-auth.routes";

const router: Router = Router();

router.use("/auth", staffAuthRoutes);

export default router;
