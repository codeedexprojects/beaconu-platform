import { notFound } from "next/navigation";
import { getCollegeBySlug } from "@/lib/services/public-college.service";
import { InterviewPageClient } from "@/components/interview/interview-page-client";

interface InterviewPageProps {
  params: Promise<{ subdomain: string; applicationId: string }>;
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { subdomain, applicationId } = await params;

  try {
    await getCollegeBySlug(subdomain);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Interview
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Book a slot for your admission interview, or view your existing booking.
      </p>
      <div className="mt-8">
        <InterviewPageClient
          applicationId={applicationId}
          subdomain={subdomain}
        />
      </div>
    </div>
  );
}
