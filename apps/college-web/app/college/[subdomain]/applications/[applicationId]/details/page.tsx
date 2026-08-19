import { notFound } from "next/navigation";
import { getCollegeBySlug } from "@/lib/services/public-college.service";
import { ApplicationDetailsPageClient } from "@/components/applications/application-details-page-client";

interface ApplicationDetailsPageProps {
  params: Promise<{ subdomain: string; applicationId: string }>;
}

export default async function ApplicationDetailsPage({
  params,
}: ApplicationDetailsPageProps) {
  const { subdomain, applicationId } = await params;

  try {
    await getCollegeBySlug(subdomain);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Application Details
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Fill in your personal, family, address, and qualification details.
      </p>
      <div className="mt-8">
        <ApplicationDetailsPageClient
          applicationId={applicationId}
          subdomain={subdomain}
        />
      </div>
    </div>
  );
}
