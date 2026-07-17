import { notFound } from "next/navigation";
import { getStudentHousingTab } from "@/lib/services/public-course.service";
import { StudentHousingSection } from "@/components/course-detail/student-housing-section";

interface StudentHousingPageProps {
  params: Promise<{ subdomain: string; courseId: string }>;
}

export default async function StudentHousingPage({
  params,
}: StudentHousingPageProps) {
  const { subdomain, courseId } = await params;

  const tab = await getStudentHousingTab(subdomain, courseId).catch(() => null);

  if (!tab) notFound();

  return (
    <StudentHousingSection
      summary={tab.data.summary}
      hostels={tab.data.hostels ?? []}
      subdomain={subdomain}
    />
  );
}
