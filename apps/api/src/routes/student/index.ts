import { Router } from "express";

import studentAuthRoutes from "@/modules/auth/routes/student-auth.routes";
import studentBlogRoutes from "@/modules/content/routes/student.routes";
import studentCommunityRoutes from "@/modules/community/routes/student.routes";
import studentNewsAlertsRoutes from "@/modules/platform-admin/routes/news-alerts-student.routes";
import studentEntranceExamsRoutes from "@/modules/platform-admin/routes/entrance-exams-student.routes";
import studentFinancialAidLoansRoutes from "@/modules/platform-admin/routes/financial-aid-loans-public.routes";
import studentProfileRoutes from "@/modules/students/routes/student.routes";
import studentUploadRoutes from "@/modules/upload/routes/student.routes";

const router: Router = Router();

router.use("/auth", studentAuthRoutes);
router.use("/blogs", studentBlogRoutes);
router.use("/communities", studentCommunityRoutes);
router.use("/news", studentNewsAlertsRoutes);
router.use("/entrance-exams", studentEntranceExamsRoutes);
router.use("/financial-aid/loans", studentFinancialAidLoansRoutes);
router.use("/", studentProfileRoutes);
router.use("/uploads", studentUploadRoutes);

export default router;
