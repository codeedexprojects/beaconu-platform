import { notFound } from "next/navigation";
import {
  getCollegeBySlug,
  getInstitutionsAcrossWorldSection,
} from "@/lib/services/public-college.service";
import { InstitutionsSection } from "@/components/college-landing/institutions-section";

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

  const section = await getInstitutionsAcrossWorldSection(
    collegeDetails.id,
  ).catch(() => null);

  if (!section || section.data.institutions.length === 0) notFound();

  return <InstitutionsSection section={section.data} subdomain={subdomain} />;
}
