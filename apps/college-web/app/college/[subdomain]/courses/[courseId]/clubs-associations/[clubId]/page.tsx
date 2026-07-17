import { notFound } from "next/navigation";
import { getClubDetail } from "@/lib/services/public-course.service";
import { ClubDetailSection } from "@/components/course-detail/club-detail-section";
import { BackToCollegeLink } from "@/components/college-landing/back-to-college-link";

interface ClubDetailPageProps {
  params: Promise<{ subdomain: string; courseId: string; clubId: string }>;
}

export default async function ClubDetailPage({ params }: ClubDetailPageProps) {
  const { subdomain, courseId, clubId } = await params;

  let club;
  try {
    club = await getClubDetail(subdomain, courseId, clubId);
  } catch {
    notFound();
  }

  return (
    <>
      <BackToCollegeLink
        subdomain={subdomain}
        href={`/college/${subdomain}/courses/${courseId}/clubs-associations`}
        label="Back to clubs & associations"
      />
      <ClubDetailSection club={club} />
    </>
  );
}
