import { Router } from "express";
import { authenticate } from "@/shared/middleware/authenticate";
import { authorizeUserType } from "@/shared/middleware/authorize";
import { CollegeComparisonStudentController } from "../controllers/student.controller";

const router: Router = Router();

// Any authenticated student — not gated on enrollment at either college
// being compared, unlike most other Student Hub features in this codebase.
router.use(authenticate, authorizeUserType("student"));

router.get(
  "/colleges/:collegeId/hero",
  CollegeComparisonStudentController.getHero,
);
router.get(
  "/colleges/:collegeId/campus-details",
  CollegeComparisonStudentController.getCampusDetails,
);
router.get(
  "/colleges/:collegeId/accreditation",
  CollegeComparisonStudentController.getAccreditationAffiliation,
);
router.get(
  "/colleges/:collegeId/university-details",
  CollegeComparisonStudentController.getUniversityDetails,
);
router.get(
  "/colleges/:collegeId/student-life",
  CollegeComparisonStudentController.getStudentLife,
);

router.get(
  "/colleges/:collegeId/courses/:courseId/details",
  CollegeComparisonStudentController.getCourseDetails,
);
router.get(
  "/colleges/:collegeId/courses/:courseId/eligibility",
  CollegeComparisonStudentController.getEligibility,
);
router.get(
  "/colleges/:collegeId/courses/:courseId/entrance-exams",
  CollegeComparisonStudentController.getEntranceExams,
);
router.get(
  "/colleges/:collegeId/courses/:courseId/curriculum",
  CollegeComparisonStudentController.getCurriculum,
);
router.get(
  "/colleges/:collegeId/courses/:courseId/value-added",
  CollegeComparisonStudentController.getValueAdded,
);
router.get(
  "/colleges/:collegeId/courses/:courseId/fees",
  CollegeComparisonStudentController.getFees,
);
router.get(
  "/colleges/:collegeId/courses/:courseId/placements",
  CollegeComparisonStudentController.getPlacements,
);
router.get(
  "/colleges/:collegeId/courses/:courseId/housing",
  CollegeComparisonStudentController.getHousing,
);

export default router;
