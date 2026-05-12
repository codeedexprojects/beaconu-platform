import { Router } from "express";

import publicUniversityRoutes from "@/modules/universities/routes/public.routes";

const router: Router = Router();

router.use("/universities", publicUniversityRoutes);

export default router;
