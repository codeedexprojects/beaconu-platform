import { Router } from "express";

import counsellorAuthRoutes from "@/modules/auth/routes/counsellor-auth.routes";
import counsellorRoutes from "@/modules/counselling/routes/counsellor.routes";
import blogCounsellorRoutes from "@/modules/content/routes/blog-counsellor.routes";

const router: Router = Router();

router.use("/auth", counsellorAuthRoutes);
router.use("/blogs", blogCounsellorRoutes);
router.use("/", counsellorRoutes);

export default router;
