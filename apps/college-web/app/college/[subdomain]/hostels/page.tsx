import { HostelsPageClient } from "@/components/college-landing/hostels-page-client";
import { getHostels } from "@/lib/services/public-hostel.service";
import {
  getCollegeBySlug,
  getCollegeOverviewSection,
} from "@/lib/services/public-college.service";
import { SiteFooter } from "@/components/college-landing/site-footer";
import { notFound } from "next/navigation";

interface HostelsPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function HostelsPage({ params }: HostelsPageProps) {
  const { subdomain } = await params;

  let collegeDetails;
  try {
    ({ collegeDetails } = await getCollegeBySlug(subdomain));
  } catch {
    notFound();
  }

  const [hostels, overview] = await Promise.all([
    getHostels(subdomain).catch(() => []),
    getCollegeOverviewSection(collegeDetails.id).catch(() => null),
  ]);
  const overviewData = overview?.data;

  return (
    <div className="pb-16">
      <HostelsPageClient subdomain={subdomain} hostels={hostels} />

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
    </div>
  );
}
