import { notFound } from "next/navigation";
import {
  getCollegeBySlug,
  getCollegeOverviewSection,
  getCommuteSection,
} from "@/lib/services/public-college.service";
import { CommuteSection } from "@/components/college-landing/commute-section";
import { SiteFooter } from "@/components/college-landing/site-footer";

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

  const [section, overview] = await Promise.all([
    getCommuteSection(collegeDetails.id).catch(() => null),
    getCollegeOverviewSection(collegeDetails.id).catch(() => null),
  ]);
  const overviewData = overview?.data;

  if (!section) notFound();

  const hasContent =
    (section.data.routes?.length ?? 0) > 0 ||
    (section.data.pickup_points?.length ?? 0) > 0 ||
    (section.data.rules_and_code_of_conduct?.rules?.length ?? 0) > 0;

  if (!hasContent) notFound();

  return (
    <>
      <CommuteSection commute={section.data} subdomain={subdomain} />
      <SiteFooter
        collegeName={collegeDetails.name}
        logoUrl={collegeDetails.logoUrl}
        subdomain={subdomain}
        address={
          overviewData?.location?.address ||
          [collegeDetails.address, collegeDetails.city, collegeDetails.state]
            .filter(Boolean)
            .join(", ")
        }
        mapLink={overviewData?.location?.map_link}
        social={overviewData?.social ?? []}
      />
    </>
  );
}
