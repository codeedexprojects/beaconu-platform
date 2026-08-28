import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
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
    <div className="pb-16">
      <div className="bg-headerTeal-dark py-6">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href={`/college/${subdomain}/applications/${applicationId}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Back to application"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
              <FileText className="h-6 w-6" />
              Application Details
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Fill in your personal, family, address, and qualification details.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
        <ApplicationDetailsPageClient
          applicationId={applicationId}
          subdomain={subdomain}
        />
      </div>
    </div>
  );
}
