import { notFound } from "next/navigation";
import { getFinancialAidTab } from "@/lib/services/public-course.service";
import { FinancialAidSection } from "@/components/course-detail/financial-aid-section";

interface FinancialAidPageProps {
  params: Promise<{ subdomain: string; courseId: string }>;
}

export default async function FinancialAidPage({
  params,
}: FinancialAidPageProps) {
  const { subdomain, courseId } = await params;

  const tab = await getFinancialAidTab(subdomain, courseId).catch(() => null);

  if (!tab) notFound();

  return (
    <FinancialAidSection aid={tab.data} slug={subdomain} courseId={courseId} />
  );
}
