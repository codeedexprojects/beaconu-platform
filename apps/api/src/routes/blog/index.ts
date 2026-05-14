import { Router } from "express";

import blogAuthRoutes from "@/modules/auth/routes/blog-auth.routes";

const router: Router = Router();

router.use("/auth", blogAuthRoutes);

export default router;
