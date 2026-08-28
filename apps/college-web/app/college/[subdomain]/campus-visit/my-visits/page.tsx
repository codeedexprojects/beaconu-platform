import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarCheck } from "lucide-react";
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
    <div className="pb-16">
      <div className="bg-headerTeal-dark py-6">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/college/${subdomain}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Back to college page"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
              <CalendarCheck className="h-6 w-6" />
              My Campus Visits
            </h1>
          </div>
          <Link
            href={`/college/${subdomain}/campus-visit`}
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-headerTeal-dark hover:bg-white/90"
          >
            Book another visit
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6">
        <MyVisitsList collegeId={collegeDetails.id} subdomain={subdomain} />
      </div>
    </div>
  );
}
