import { LibraryCard } from "@/components/library-detail/library-card";
import type { PublicLibrary } from "@beaconu/types";

interface CourseLibrarySectionProps {
  libraries: PublicLibrary[];
  subdomain: string;
}

export function CourseLibrarySection({
  libraries,
  subdomain,
}: CourseLibrarySectionProps) {
  if (libraries.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-muted-foreground sm:px-6">
        Library details aren&apos;t available yet.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-bold tracking-tight">Library</h2>
      <div className="mt-5 space-y-6">
        {libraries.map((library) => (
          <LibraryCard
            key={library.id}
            library={library}
            subdomain={subdomain}
          />
        ))}
      </div>
    </div>
  );
}
