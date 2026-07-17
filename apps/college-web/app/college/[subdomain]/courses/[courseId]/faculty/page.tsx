import { notFound } from "next/navigation";
import { getFacultyTab } from "@/lib/services/public-course.service";
import { FacultySection } from "@/components/course-detail/faculty-section";

interface FacultyPageProps {
  params: Promise<{ subdomain: string; courseId: string }>;
}

export default async function FacultyPage({ params }: FacultyPageProps) {
  const { subdomain, courseId } = await params;

  const faculty = await getFacultyTab(subdomain, courseId).catch(() => null);

  if (!faculty) notFound();

  return <FacultySection faculty={faculty} />;
}
