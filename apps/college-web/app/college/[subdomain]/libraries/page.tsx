import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { getLibraries } from "@/lib/services/public-library.service";

interface LibrariesPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function LibrariesPage({ params }: LibrariesPageProps) {
  const { subdomain } = await params;

  const libraries = await getLibraries(subdomain).catch(() => []);

  return (
    <div className="pb-16">
      <div className="bg-headerTeal-dark py-6">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link
            href={`/college/${subdomain}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Back to college page"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
            <BookOpen className="h-6 w-6" />
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
    </div>
  );
}
