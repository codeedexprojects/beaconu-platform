import { notFound } from "next/navigation";
import { getCourseCommuteTab } from "@/lib/services/public-course.service";
import { CourseCommuteSection } from "@/components/course-detail/course-commute-section";

interface CourseCommutePageProps {
  params: Promise<{ subdomain: string; courseId: string }>;
}

export default async function CourseCommutePage({
  params,
}: CourseCommutePageProps) {
  const { subdomain, courseId } = await params;

  const tab = await getCourseCommuteTab(subdomain, courseId).catch(() => null);

  if (!tab) notFound();

  return (
    <CourseCommuteSection
      summary={tab.data.summary}
      routes={tab.data.routes ?? []}
    />
  );
}
