import { notFound } from "next/navigation";
import {
  getCollegeBySlug,
  getCodeOfConductSection,
  getCollegeOverviewSection,
} from "@/lib/services/public-college.service";
import { CodeOfConductSection } from "@/components/college-landing/code-of-conduct-section";
import { SiteFooter } from "@/components/college-landing/site-footer";

interface CodeOfConductPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function CodeOfConductPage({
  params,
}: CodeOfConductPageProps) {
  const { subdomain } = await params;

  let collegeDetails;
  let tabs;
  try {
    ({ collegeDetails, tabs } = await getCollegeBySlug(subdomain));
  } catch {
    notFound();
  }

  if (!tabs.some((tab) => tab.id === "student_code_of_conduct")) {
    notFound();
  }

  const [section, overview] = await Promise.all([
    getCodeOfConductSection(collegeDetails.id).catch(() => null),
    getCollegeOverviewSection(collegeDetails.id).catch(() => null),
  ]);
  const overviewData = overview?.data;

  if (!section || (section.data.rules?.length ?? 0) === 0) notFound();

  return (
    <>
      <CodeOfConductSection section={section.data} subdomain={subdomain} />
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
