import { notFound } from "next/navigation";
import { getCollegeBySlug } from "@/lib/services/public-college.service";
import { AssessmentPageClient } from "@/components/assessment/assessment-page-client";

interface AssessmentPageProps {
  params: Promise<{ subdomain: string; applicationId: string }>;
}

export default async function AssessmentPage({ params }: AssessmentPageProps) {
  const { subdomain, applicationId } = await params;

  try {
    await getCollegeBySlug(subdomain);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Assessment
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Review the assessment format and try a practice trial before your real
        attempt.
      </p>
      <div className="mt-8">
        <AssessmentPageClient
          applicationId={applicationId}
          subdomain={subdomain}
        />
      </div>
    </div>
  );
}
