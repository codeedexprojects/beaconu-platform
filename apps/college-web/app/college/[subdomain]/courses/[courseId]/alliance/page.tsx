import { notFound } from "next/navigation";
import { getAllianceTab } from "@/lib/services/public-course.service";
import { AllianceSection } from "@/components/course-detail/alliance-section";

interface AlliancePageProps {
  params: Promise<{ subdomain: string; courseId: string }>;
}

export default async function AlliancePage({ params }: AlliancePageProps) {
  const { subdomain, courseId } = await params;

  const tab = await getAllianceTab(subdomain, courseId).catch(() => null);

  if (!tab) notFound();

  return <AllianceSection partners={tab.data} />;
}
