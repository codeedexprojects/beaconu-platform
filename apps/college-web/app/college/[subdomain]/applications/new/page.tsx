import { notFound, redirect } from "next/navigation";
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
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Start Your Application
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Applying to {collegeDetails.name}. Choose a course and provide your
        basic details to begin.
      </p>
      <div className="mt-8">
        <NewApplicationPageClient cycleId={cycle} subdomain={subdomain} />
      </div>
    </div>
  );
}
