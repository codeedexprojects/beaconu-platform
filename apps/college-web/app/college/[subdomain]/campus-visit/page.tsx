import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarCheck } from "lucide-react";
import { getCollegeBySlug } from "@/lib/services/public-college.service";
import { CampusVisitPageClient } from "@/components/campus-visit/campus-visit-page-client";

interface CampusVisitPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function CampusVisitPage({
  params,
}: CampusVisitPageProps) {
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
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 sm:px-6">
          <Link
            href={`/college/${subdomain}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Back to college page"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
              <CalendarCheck className="h-6 w-6" />
              Book a Campus Visit
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Schedule a visit to {collegeDetails.name} and meet a student
              ambassador.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6">
        <CampusVisitPageClient
          collegeId={collegeDetails.id}
          subdomain={subdomain}
        />
      </div>
    </div>
  );
}
