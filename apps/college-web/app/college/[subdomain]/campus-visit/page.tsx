import { notFound } from "next/navigation";
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
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Book a Campus Visit
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Schedule a visit to {collegeDetails.name} and meet a student ambassador.
      </p>
      <div className="mt-8">
        <CampusVisitPageClient
          collegeId={collegeDetails.id}
          subdomain={subdomain}
        />
      </div>
    </div>
  );
}
