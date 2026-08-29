import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { getLibraries } from "@/lib/services/public-library.service";
import { getCollegeBySlug } from "@/lib/services/public-college.service";
import { SiteFooter } from "@/components/college-landing/site-footer";

interface LibrariesPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function LibrariesPage({ params }: LibrariesPageProps) {
  const { subdomain } = await params;

  let collegeDetails;
  try {
    ({ collegeDetails } = await getCollegeBySlug(subdomain));
  } catch {
    notFound();
  }

  const libraries = await getLibraries(subdomain).catch(() => []);

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
            <BookOpen className="h-7 w-7" />
            Libraries
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        {libraries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No libraries are listed for this college yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {libraries.map((library) => (
              <Link
                key={library.id}
                href={`/college/${subdomain}/libraries/${library.id}`}
                className="rounded-2xl bg-field p-5 transition-colors hover:bg-field-focus"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-background">
                    <BookOpen className="h-5 w-5 text-headerTeal" />
                  </span>
                  {library.type ? (
                    <span className="rounded-full bg-headerTeal-dark px-2.5 py-0.5 text-xs font-medium capitalize text-white">
                      {library.type}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm font-semibold">{library.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {library.availableResources?.items?.length ?? 0} resource
                  types
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <SiteFooter
        collegeName={collegeDetails.name}
        logoUrl={collegeDetails.logoUrl}
        subdomain={subdomain}
        address={[
          collegeDetails.address,
          collegeDetails.city,
          collegeDetails.state,
        ]
          .filter(Boolean)
          .join(", ")}
        social={[]}
      />
    </div>
  );
}
