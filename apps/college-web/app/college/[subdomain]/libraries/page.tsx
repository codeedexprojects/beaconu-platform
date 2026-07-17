import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getLibraries } from "@/lib/services/public-library.service";

interface LibrariesPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function LibrariesPage({ params }: LibrariesPageProps) {
  const { subdomain } = await params;

  const libraries = await getLibraries(subdomain).catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Libraries
      </h1>

      {libraries.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No libraries are listed for this college yet.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {libraries.map((library) => (
            <Link
              key={library.id}
              href={`/college/${subdomain}/libraries/${library.id}`}
              className="rounded-2xl border border-border/60 p-5 transition-colors hover:border-foreground/30"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                </span>
                {library.type ? (
                  <Badge variant="secondary" className="capitalize">
                    {library.type}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-3 text-sm font-semibold">{library.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {library.availableResources?.items?.length ?? 0} resource types
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
