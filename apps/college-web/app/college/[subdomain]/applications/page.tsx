import { notFound } from "next/navigation";
import { getCollegeBySlug } from "@/lib/services/public-college.service";
import { AdmissionCyclesList } from "@/components/applications/admission-cycles-list";

interface ApplicationsPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function ApplicationsPage({
  params,
}: ApplicationsPageProps) {
  const { subdomain } = await params;

  let collegeDetails;
  try {
    ({ collegeDetails } = await getCollegeBySlug(subdomain));
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Apply to {collegeDetails.name}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose an admission cycle to start your application.
      </p>
      <div className="mt-8">
        <AdmissionCyclesList
          collegeId={collegeDetails.id}
          subdomain={subdomain}
        />
      </div>
    </div>
  );
}
