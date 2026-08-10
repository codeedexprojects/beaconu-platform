import { notFound } from "next/navigation";
import { getCollegeBySlug } from "@/lib/services/public-college.service";
import { SubmitQueryForm } from "@/components/queries/submit-query-form";

interface SubmitQueryPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function SubmitQueryPage({
  params,
}: SubmitQueryPageProps) {
  const { subdomain } = await params;

  let collegeDetails;
  try {
    ({ collegeDetails } = await getCollegeBySlug(subdomain));
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Submit New Query
      </h1>
      <SubmitQueryForm collegeId={collegeDetails.id} subdomain={subdomain} />
    </div>
  );
}
