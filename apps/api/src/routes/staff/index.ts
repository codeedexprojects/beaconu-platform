import { Router } from "express";

import blogStaffRoutes from "@/modules/content/routes/blog-staff.routes";

const router: Router = Router();

router.use("/blogs", blogStaffRoutes);

export default router;
