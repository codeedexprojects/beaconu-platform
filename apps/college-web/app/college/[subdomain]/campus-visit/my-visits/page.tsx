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
      <div className="relative bg-[#E6F7FF] py-10">
        <Link
          href={`/college/${subdomain}`}
          className="absolute left-4 top-6 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted sm:left-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h1 className="flex items-center justify-center gap-2.5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            <CalendarCheck className="h-7 w-7" />
            My Campus Visits
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6">
        <div className="mb-6 flex justify-end">
          <Link
            href={`/college/${subdomain}/campus-visit`}
            className="rounded-full bg-headerTeal-dark px-4 py-2 text-sm font-medium text-white hover:bg-headerTeal-dark/90"
          >
            Book another visit
          </Link>
        </div>
        <MyVisitsList collegeId={collegeDetails.id} subdomain={subdomain} />
      </div>
    </div>
  );
}
