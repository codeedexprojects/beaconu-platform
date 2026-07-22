import { notFound } from "next/navigation";
import { getReviewTab } from "@/lib/services/public-course.service";
import { ReviewSection } from "@/components/course-detail/review-section";

interface ReviewsPageProps {
  params: Promise<{ subdomain: string; courseId: string }>;
}

export default async function ReviewsPage({ params }: ReviewsPageProps) {
  const { subdomain, courseId } = await params;

  const tab = await getReviewTab(subdomain, courseId).catch(() => null);

  if (!tab) notFound();

  return (
    <ReviewSection review={tab.data} slug={subdomain} courseId={courseId} />
  );
}
