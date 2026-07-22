import { getClubsList } from "@/lib/services/public-course.service";
import { ClubsList } from "@/components/course-detail/clubs-list";

interface ClubsAssociationsPageProps {
  params: Promise<{ subdomain: string; courseId: string }>;
}

export default async function ClubsAssociationsPage({
  params,
}: ClubsAssociationsPageProps) {
  const { subdomain, courseId } = await params;

  const result = await getClubsList(subdomain, courseId, 1, 12).catch(() => ({
    list: [],
    pagination: undefined,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-bold tracking-tight">Clubs & Associations</h2>
      <div className="mt-5">
        <ClubsList
          slug={subdomain}
          courseId={courseId}
          basePath={`/college/${subdomain}/courses/${courseId}/clubs-associations`}
          initialClubs={result.list ?? []}
          initialHasMore={Boolean(result.pagination?.has_next_page)}
        />
      </div>
    </div>
  );
}
