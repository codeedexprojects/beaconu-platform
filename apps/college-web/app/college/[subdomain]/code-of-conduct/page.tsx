import { notFound } from "next/navigation";
import {
  getCollegeBySlug,
  getCodeOfConductSection,
} from "@/lib/services/public-college.service";
import { CodeOfConductSection } from "@/components/college-landing/code-of-conduct-section";

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

  const section = await getCodeOfConductSection(collegeDetails.id).catch(
    () => null,
  );

  if (!section || (section.data.rules?.length ?? 0) === 0) notFound();

  return <CodeOfConductSection section={section.data} subdomain={subdomain} />;
}
