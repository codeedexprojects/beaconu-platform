import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";

import studentAuthRoutes from "@/modules/auth/routes/student-auth.routes";
import studentBlogRoutes from "@/modules/content/routes/student.routes";
import studentCommunityRoutes from "@/modules/community/routes/student.routes";
import studentNewsAlertsRoutes from "@/modules/platform-admin/routes/news-alerts-student.routes";
import studentEntranceExamsRoutes from "@/modules/platform-admin/routes/entrance-exams-student.routes";
import studentEducationBoardsRoutes from "@/modules/platform-admin/routes/education-boards-student.routes";
import studentFinancialAidLoansRoutes from "@/modules/platform-admin/routes/financial-aid-loans-public.routes";
import studentProfileRoutes from "@/modules/students/routes/student.routes";
import studentUploadRoutes from "@/modules/upload/routes/student.routes";
import studentCounsellingRoutes from "@/modules/counselling/routes/student.routes";
import studentEventRoutes from "@/modules/events/routes/student.routes";
import studentCampusVisitRoutes from "@/modules/campus-visits/routes/student.routes";
import studentDocumentsRoutes from "@/modules/documents/routes/student.routes";
import studentAntiRaggingRoutes from "@/modules/anti-ragging/routes/student.routes";
import studentWishlistRoutes from "@/modules/wishlist/routes/student.routes";
import studentAdmissionCycleRoutes from "@/modules/admissions/routes/student.routes";
import studentAssessmentRoutes from "@/modules/assessments/routes/student.routes";
import studentPaymentRoutes from "@/modules/payments/routes/student.routes";
import studentInterviewRoutes from "@/modules/interviews/routes/student.routes";
import studentScholarshipRoutes from "@/modules/scholarships/routes/student.routes";
import studentCommuteRoutes from "@/modules/commute/routes/student.routes";
import studentHostelRoutes from "@/modules/hostel/routes/student.routes";
import studentEngagementRoutes from "@/modules/engagement/routes/student.routes";

const router: Router = Router();

router.use("/auth", studentAuthRoutes);
router.use("/blogs", studentBlogRoutes);
router.use("/communities", studentCommunityRoutes);
router.use("/news", studentNewsAlertsRoutes);
router.use("/entrance-exams", studentEntranceExamsRoutes);
router.use("/education-boards", studentEducationBoardsRoutes);
router.use("/financial-aid/loans", studentFinancialAidLoansRoutes);
router.use("/counselling", studentCounsellingRoutes);
router.use(
  "/events",
  authenticate,
  authorizeUserType("student"),
  studentEventRoutes,
);
router.use("/uploads", studentUploadRoutes);
router.use("/campus-visits", studentCampusVisitRoutes);
router.use("/documents", studentDocumentsRoutes);
router.use("/anti-ragging-complaints", studentAntiRaggingRoutes);
router.use("/wishlist", studentWishlistRoutes);
router.use("/application-forms", studentAdmissionCycleRoutes);
router.use("/assessments", studentAssessmentRoutes);
router.use("/payments", studentPaymentRoutes);
router.use("/interviews", studentInterviewRoutes);
router.use("/scholarships", studentScholarshipRoutes);
router.use("/commute", studentCommuteRoutes);
router.use("/", studentHostelRoutes);
router.use("/", studentProfileRoutes);
router.use("/", studentEngagementRoutes);

export default router;
