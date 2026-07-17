import { notFound } from "next/navigation";
import { getLibraryDetail } from "@/lib/services/public-library.service";
import { LibraryCard } from "@/components/library-detail/library-card";
import { BackToCollegeLink } from "@/components/college-landing/back-to-college-link";

interface LibraryDetailPageProps {
  params: Promise<{ subdomain: string; libraryId: string }>;
}

export default async function LibraryDetailPage({
  params,
}: LibraryDetailPageProps) {
  const { subdomain, libraryId } = await params;

  let library;
  try {
    library = await getLibraryDetail(subdomain, libraryId);
  } catch {
    notFound();
  }

  return (
    <>
      <BackToCollegeLink
        subdomain={subdomain}
        href={`/college/${subdomain}/libraries`}
        label="Back to libraries"
      />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <LibraryCard library={library} />
      </div>
    </>
  );
}
