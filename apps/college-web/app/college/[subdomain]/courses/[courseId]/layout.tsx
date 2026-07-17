import { notFound } from "next/navigation";
import { getCourseDetail } from "@/lib/services/public-course.service";
import { CourseHeader } from "@/components/course-detail/course-header";
import { CourseTabNav } from "@/components/course-detail/course-tab-nav";
import { BackToCollegeLink } from "@/components/college-landing/back-to-college-link";

interface CourseLayoutProps {
  children: React.ReactNode;
  params: Promise<{ subdomain: string; courseId: string }>;
}

export default async function CourseLayout({
  children,
  params,
}: CourseLayoutProps) {
  const { subdomain, courseId } = await params;

  let course;
  try {
    course = await getCourseDetail(subdomain, courseId);
  } catch {
    notFound();
  }

  const basePath = `/college/${subdomain}/courses/${courseId}`;

  return (
    <>
      <BackToCollegeLink
        subdomain={subdomain}
        href={`/college/${subdomain}#courses`}
        label="Back to courses"
      />
      <CourseHeader
        name={course.name}
        quickInfo={course.quick_info ?? []}
        admissionBatches={course.admission_batches ?? []}
      />
      <CourseTabNav tabs={course.tabs ?? []} basePath={basePath} />
      {children}
    </>
  );
}
