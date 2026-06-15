import { Router } from "express";

import counsellorAuthRoutes from "@/modules/auth/routes/counsellor-auth.routes";
import counsellorRoutes from "@/modules/counselling/routes/counsellor.routes";
import counsellorUploadRoutes from "@/modules/upload/routes/counsellor.routes";

const router: Router = Router();

router.use("/auth", counsellorAuthRoutes);
router.use("/uploads", counsellorUploadRoutes);
router.use("/", counsellorRoutes);

export default router;
