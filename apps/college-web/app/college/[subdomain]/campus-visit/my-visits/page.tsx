import { notFound } from "next/navigation";
import Link from "next/link";
import { getCollegeBySlug } from "@/lib/services/public-college.service";
import { MyVisitsList } from "@/components/campus-visit/my-visits-list";

interface MyVisitsPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function MyVisitsPage({ params }: MyVisitsPageProps) {
  const { subdomain } = await params;

  let collegeDetails;
  try {
    ({ collegeDetails } = await getCollegeBySlug(subdomain));
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          My Campus Visits
        </h1>
        <Link
          href={`/college/${subdomain}/campus-visit`}
          className="text-sm font-medium hover:underline"
        >
          Book another visit
        </Link>
      </div>
      <div className="mt-8">
        <MyVisitsList collegeId={collegeDetails.id} subdomain={subdomain} />
      </div>
    </div>
  );
}
