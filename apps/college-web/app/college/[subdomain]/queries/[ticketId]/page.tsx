import { notFound } from "next/navigation";
import { getCollegeBySlug } from "@/lib/services/public-college.service";
import { QueryThread } from "@/components/queries/query-thread";

interface QueryThreadPageProps {
  params: Promise<{ subdomain: string; ticketId: string }>;
}

export default async function QueryThreadPage({
  params,
}: QueryThreadPageProps) {
  const { subdomain, ticketId } = await params;

  try {
    await getCollegeBySlug(subdomain);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl sm:px-6">
      <QueryThread ticketId={ticketId} subdomain={subdomain} />
    </div>
  );
}
