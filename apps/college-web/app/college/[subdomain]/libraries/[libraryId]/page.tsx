import { notFound } from "next/navigation";
import { getLibraryDetail } from "@/lib/services/public-library.service";
import { LibraryCard } from "@/components/library-detail/library-card";

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

  return <LibraryCard library={library} subdomain={subdomain} />;
}
