import { notFound } from "next/navigation";
import { getLibraryTab } from "@/lib/services/public-course.service";
import { CourseLibrarySection } from "@/components/course-detail/course-library-section";

interface LibraryTabPageProps {
  params: Promise<{ subdomain: string; courseId: string }>;
}

export default async function LibraryTabPage({ params }: LibraryTabPageProps) {
  const { subdomain, courseId } = await params;

  const tab = await getLibraryTab(subdomain, courseId).catch(() => null);

  if (!tab) notFound();

  return <CourseLibrarySection libraries={tab.data.libraries ?? []} />;
}
