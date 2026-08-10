import { notFound } from "next/navigation";
import { getCollegeBySlug } from "@/lib/services/public-college.service";
import { QueriesList } from "@/components/queries/queries-list";

interface QueriesPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function QueriesPage({ params }: QueriesPageProps) {
  const { subdomain } = await params;

  try {
    await getCollegeBySlug(subdomain);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        My Queries
      </h1>
      <div className="mt-6">
        <QueriesList subdomain={subdomain} />
      </div>
    </div>
  );
}
