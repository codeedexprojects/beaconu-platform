import { notFound } from "next/navigation";
import {
  getCollegeBySlug,
  getCommuteSection,
} from "@/lib/services/public-college.service";
import { CommuteSection } from "@/components/college-landing/commute-section";
import { BackToCollegeLink } from "@/components/college-landing/back-to-college-link";

interface CommutePageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function CommutePage({ params }: CommutePageProps) {
  const { subdomain } = await params;

  let collegeDetails;
  let tabs;
  try {
    ({ collegeDetails, tabs } = await getCollegeBySlug(subdomain));
  } catch {
    notFound();
  }

  if (!tabs.some((tab) => tab.id === "commute")) {
    notFound();
  }

  const section = await getCommuteSection(collegeDetails.id).catch(() => null);

  if (!section) notFound();

  const hasContent =
    (section.data.routes?.length ?? 0) > 0 ||
    (section.data.pickup_points?.length ?? 0) > 0 ||
    (section.data.rules_and_code_of_conduct?.rules?.length ?? 0) > 0;

  if (!hasContent) notFound();

  return (
    <>
      <BackToCollegeLink subdomain={subdomain} />
      <CommuteSection commute={section.data} />
    </>
  );
}
