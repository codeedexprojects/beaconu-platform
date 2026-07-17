import { notFound } from "next/navigation";
import { getFeesTab } from "@/lib/services/public-course.service";
import { FeesSection } from "@/components/course-detail/fees-section";

interface FeesPageProps {
  params: Promise<{ subdomain: string; courseId: string }>;
}

export default async function FeesPage({ params }: FeesPageProps) {
  const { subdomain, courseId } = await params;

  const fees = await getFeesTab(subdomain, courseId).catch(() => null);

  if (!fees || (fees.fee_details?.length ?? 0) === 0) notFound();

  return <FeesSection fees={fees} />;
}
