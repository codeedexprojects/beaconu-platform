import { Router } from "express";

import publicUniversityRoutes from "@/modules/universities/routes/public.routes";
import publicBlogRoutes from "@/modules/content/routes/public.routes";

const router: Router = Router();

router.use("/universities", publicUniversityRoutes);
router.use("/blogs", publicBlogRoutes);

export default router;
