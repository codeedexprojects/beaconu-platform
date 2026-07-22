import { notFound } from "next/navigation";
import { getCourseDetail } from "@/lib/services/public-course.service";
import {
  HighlightsBlock,
  AccreditationsBlock,
  KeyDatesBlock,
  CourseStructureBlock,
  ValueAddedCoursesBlock,
  CareerOpportunitiesBlock,
  HigherEducationCertificationsBlock,
  FlexibleExitOptionsBlock,
  ClassTimingsBlock,
  SimpleNameListBlock,
  FeaturedAlumniBlock,
  StudentForumBlock,
  CertificationsBlock,
} from "@/components/course-detail/course-info-blocks";
import { CurriculumSection } from "@/components/course-detail/curriculum-section";
import { FaqsSection } from "@/components/course-detail/faqs-section";

interface CourseInfoPageProps {
  params: Promise<{ subdomain: string; courseId: string }>;
}

export default async function CourseInfoPage({ params }: CourseInfoPageProps) {
  const { subdomain, courseId } = await params;

  let course;
  try {
    course = await getCourseDetail(subdomain, courseId);
  } catch {
    notFound();
  }

  return (
    <>
      {course.highlights ? (
        <HighlightsBlock highlights={course.highlights} />
      ) : null}
      {course.curriculum ? (
        <CurriculumSection curriculum={course.curriculum} />
      ) : null}
      {course.courseStructure ? (
        <CourseStructureBlock structure={course.courseStructure} />
      ) : null}
      {course.accreditations ? (
        <AccreditationsBlock accreditations={course.accreditations} />
      ) : null}
      {course.keyDates ? <KeyDatesBlock keyDates={course.keyDates} /> : null}
      {course.careerOpportunities ? (
        <CareerOpportunitiesBlock career={course.careerOpportunities} />
      ) : null}
      {course.valueAddedCourses ? (
        <ValueAddedCoursesBlock value={course.valueAddedCourses} />
      ) : null}
      {course.higherEducationCertifications ? (
        <HigherEducationCertificationsBlock
          certs={course.higherEducationCertifications}
        />
      ) : null}
      {course.flexibleExitOptions ? (
        <FlexibleExitOptionsBlock exit={course.flexibleExitOptions} />
      ) : null}
      {course.classTimings ? (
        <ClassTimingsBlock timings={course.classTimings} />
      ) : null}
      {course.industryTools ? (
        <SimpleNameListBlock list={course.industryTools} />
      ) : null}
      {course.labFacilities ? (
        <SimpleNameListBlock list={course.labFacilities} />
      ) : null}
      {course.roomFacilities ? (
        <SimpleNameListBlock list={course.roomFacilities} />
      ) : null}
      {course.featuredAlumni ? (
        <FeaturedAlumniBlock alumni={course.featuredAlumni} />
      ) : null}
      {course.certifications ? (
        <CertificationsBlock certifications={course.certifications} />
      ) : null}
      {course.faqs ? <FaqsSection faqs={course.faqs} /> : null}
      {course.studentForum ? (
        <StudentForumBlock forum={course.studentForum} />
      ) : null}
    </>
  );
}
