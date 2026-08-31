import { notFound } from "next/navigation";
import { getLibraries } from "@/lib/services/public-library.service";
import {
  getCollegeBySlug,
  getCollegeOverviewSection,
} from "@/lib/services/public-college.service";
import { LibrariesPageClient } from "@/components/college-landing/libraries-page-client";
import { SiteFooter } from "@/components/college-landing/site-footer";

interface LibrariesPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function LibrariesPage({ params }: LibrariesPageProps) {
  const { subdomain } = await params;

  let collegeDetails;
  try {
    ({ collegeDetails } = await getCollegeBySlug(subdomain));
  } catch {
    notFound();
  }

  const [libraries, overview] = await Promise.all([
    getLibraries(subdomain).catch(() => []),
    getCollegeOverviewSection(collegeDetails.id).catch(() => null),
  ]);
  const overviewData = overview?.data;

  return (
    <>
      <LibrariesPageClient subdomain={subdomain} libraries={libraries} />

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
