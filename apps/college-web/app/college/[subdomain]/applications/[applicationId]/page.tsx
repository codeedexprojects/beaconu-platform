import { notFound } from "next/navigation";
import { getCollegeBySlug } from "@/lib/services/public-college.service";
import { ApplicationDetail } from "@/components/applications/application-detail";

interface ApplicationDetailPageProps {
  params: Promise<{ subdomain: string; applicationId: string }>;
}

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { subdomain, applicationId } = await params;

  let collegeDetails;
  try {
    ({ collegeDetails } = await getCollegeBySlug(subdomain));
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Your Application
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {collegeDetails.name}
      </p>
      <div className="mt-8">
        <ApplicationDetail
          applicationId={applicationId}
          subdomain={subdomain}
        />
      </div>
    </div>
  );
}
