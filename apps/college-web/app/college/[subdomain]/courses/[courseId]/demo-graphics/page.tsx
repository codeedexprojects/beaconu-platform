import { notFound } from "next/navigation";
import { getDemographicsTab } from "@/lib/services/public-course.service";
import { DemographicsSection } from "@/components/course-detail/demographics-section";

interface DemographicsPageProps {
  params: Promise<{ subdomain: string; courseId: string }>;
}

export default async function DemographicsPage({
  params,
}: DemographicsPageProps) {
  const { subdomain, courseId } = await params;

  const tab = await getDemographicsTab(subdomain, courseId).catch(() => null);

  if (!tab) notFound();

  return <DemographicsSection demographics={tab.data} />;
}
