import { Router } from "express";

import studentAuthRoutes from "@/modules/auth/routes/student-auth.routes";
import studentBlogRoutes from "@/modules/content/routes/student.routes";
import studentNewsAlertsRoutes from "@/modules/platform-admin/routes/news-alerts-student.routes";
import studentEntranceExamsRoutes from "@/modules/platform-admin/routes/entrance-exams-student.routes";

const router: Router = Router();

router.use("/auth", studentAuthRoutes);
router.use("/blogs", studentBlogRoutes);
router.use("/news", studentNewsAlertsRoutes);
router.use("/entrance-exams", studentEntranceExamsRoutes);

export default router;
