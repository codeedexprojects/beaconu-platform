import { notFound } from "next/navigation";
import {
  getCollegeBySlug,
  getHappeningsSection,
} from "@/lib/services/public-college.service";
import { HappeningsSection } from "@/components/college-landing/happenings-section";
import { BackToCollegeLink } from "@/components/college-landing/back-to-college-link";

interface HappeningsPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function HappeningsPage({ params }: HappeningsPageProps) {
  const { subdomain } = await params;

  let collegeDetails;
  let tabs;
  try {
    ({ collegeDetails, tabs } = await getCollegeBySlug(subdomain));
  } catch {
    notFound();
  }

  if (!tabs.some((tab) => tab.id === "happenings")) {
    notFound();
  }

  const section = await getHappeningsSection(collegeDetails.id).catch(
    () => null,
  );

  if (!section || (section.data.happenings?.length ?? 0) === 0) notFound();

  return (
    <>
      <BackToCollegeLink subdomain={subdomain} />
      <HappeningsSection section={section.data} />
    </>
  );
}
