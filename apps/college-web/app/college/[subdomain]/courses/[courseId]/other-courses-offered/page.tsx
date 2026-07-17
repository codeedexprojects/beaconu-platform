import { getOtherCoursesOffered } from "@/lib/services/public-course.service";
import { OtherCoursesOfferedSection } from "@/components/course-detail/other-courses-offered-section";

interface OtherCoursesOfferedPageProps {
  params: Promise<{ subdomain: string; courseId: string }>;
}

export default async function OtherCoursesOfferedPage({
  params,
}: OtherCoursesOfferedPageProps) {
  const { subdomain, courseId } = await params;

  const result = await getOtherCoursesOffered(subdomain, courseId, 1, 10).catch(
    () => ({ list: [], pagination: undefined }),
  );

  return (
    <OtherCoursesOfferedSection
      slug={subdomain}
      courseId={courseId}
      initialGroups={result.list ?? []}
      initialHasMore={Boolean(result.pagination?.has_next_page)}
    />
  );
}
