import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { getCollegeBySlug } from "@/lib/services/public-college.service";
import { NewApplicationPageClient } from "@/components/applications/new-application-page-client";

interface NewApplicationPageProps {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ cycle?: string }>;
}

export default async function NewApplicationPage({
  params,
  searchParams,
}: NewApplicationPageProps) {
  const { subdomain } = await params;
  const { cycle } = await searchParams;

  if (!cycle) {
    redirect(`/college/${subdomain}/applications`);
  }

  let collegeDetails;
  try {
    ({ collegeDetails } = await getCollegeBySlug(subdomain));
  } catch {
    notFound();
  }

  return (
    <div className="pb-16">
      <div className="bg-headerTeal-dark py-6">
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 sm:px-6">
          <Link
            href={`/college/${subdomain}/applications`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Back to applications"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
              <FileText className="h-6 w-6" />
              Start Your Application
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Applying to {collegeDetails.name}. Choose a course and provide
              your basic details to begin.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6">
        <NewApplicationPageClient cycleId={cycle} subdomain={subdomain} />
      </div>
    </div>
  );
}
