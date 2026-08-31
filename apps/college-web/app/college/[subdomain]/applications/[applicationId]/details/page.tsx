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
      <div className="relative bg-[#E6F7FF] py-10">
        <Link
          href={`/college/${subdomain}/applications/${applicationId}`}
          className="absolute left-4 top-6 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted sm:left-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h1 className="flex items-center justify-center gap-2.5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            <FileText className="h-7 w-7" />
            Application Details
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Fill in your personal, family, address, and qualification details.
          </p>
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
