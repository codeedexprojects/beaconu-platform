import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCollegeBySlug } from "@/lib/services/public-college.service";
import { ApplicationStatusPageClient } from "@/components/applications/application-status-page-client";

interface ApplicationStatusPageProps {
  params: Promise<{ subdomain: string; applicationId: string }>;
}

export default async function ApplicationStatusPage({
  params,
}: ApplicationStatusPageProps) {
  const { subdomain, applicationId } = await params;

  let collegeDetails;
  try {
    ({ collegeDetails } = await getCollegeBySlug(subdomain));
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/college/${subdomain}/applications`}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-field hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold">Application Status</h1>
      </div>
      <ApplicationStatusPageClient
        applicationId={applicationId}
        subdomain={subdomain}
        collegeId={collegeDetails.id}
      />
    </div>
  );
}
