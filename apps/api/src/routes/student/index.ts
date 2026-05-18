import { Router } from "express";

import studentAuthRoutes from "@/modules/auth/routes/student-auth.routes";
import blogStudentRoutes from "@/modules/content/routes/student.routes";

const router: Router = Router();

router.use("/auth", studentAuthRoutes);
router.use("/blogs", blogStudentRoutes);

export default router;
