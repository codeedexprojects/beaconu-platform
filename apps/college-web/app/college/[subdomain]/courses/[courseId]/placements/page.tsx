import { notFound } from "next/navigation";
import { getPlacementsTab } from "@/lib/services/public-course.service";
import { PlacementsSection } from "@/components/course-detail/placements-section";

interface PlacementsPageProps {
  params: Promise<{ subdomain: string; courseId: string }>;
}

export default async function PlacementsPage({ params }: PlacementsPageProps) {
  const { subdomain, courseId } = await params;

  const tab = await getPlacementsTab(subdomain, courseId).catch(() => null);

  if (!tab) notFound();

  return <PlacementsSection placements={tab.data} />;
}
