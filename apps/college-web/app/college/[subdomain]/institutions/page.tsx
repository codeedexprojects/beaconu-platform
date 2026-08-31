import { notFound } from "next/navigation";
import {
  getCollegeBySlug,
  getCollegeOverviewSection,
  getInstitutionsAcrossWorldSection,
} from "@/lib/services/public-college.service";
import { InstitutionsSection } from "@/components/college-landing/institutions-section";
import { SiteFooter } from "@/components/college-landing/site-footer";

interface InstitutionsPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function InstitutionsPage({
  params,
}: InstitutionsPageProps) {
  const { subdomain } = await params;

  let collegeDetails;
  let tabs;
  try {
    ({ collegeDetails, tabs } = await getCollegeBySlug(subdomain));
  } catch {
    notFound();
  }

  if (!tabs.some((tab) => tab.id === "institutions_across_world")) {
    notFound();
  }

  const [section, overview] = await Promise.all([
    getInstitutionsAcrossWorldSection(collegeDetails.id).catch(() => null),
    getCollegeOverviewSection(collegeDetails.id).catch(() => null),
  ]);
  const overviewData = overview?.data;

  if (!section || section.data.institutions.length === 0) notFound();

  return (
    <>
      <InstitutionsSection section={section.data} subdomain={subdomain} />
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
