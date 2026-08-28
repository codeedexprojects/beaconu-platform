import { notFound } from "next/navigation";
import {
  getCollegeBySlug,
  getCollegeCourses,
  getCollegeGallery,
  getCollegeOverviewSection,
  getCollegeReviews,
  getCollegeScholarships,
} from "@/lib/services/public-college.service";
import { HeroSection } from "@/components/college-landing/hero-section";
import { AboutSection } from "@/components/college-landing/about-section";
import { AdmissionsCtaSection } from "@/components/college-landing/admissions-cta-section";
import { AmenitiesSection } from "@/components/college-landing/amenities-section";
import { CampusHighlightsSection } from "@/components/college-landing/campus-highlights-section";
import { CoursesSection } from "@/components/college-landing/courses-section";
import { CampusSection } from "@/components/college-landing/campus-section";
import { ScholarshipsSection } from "@/components/college-landing/scholarships-section";
import { GallerySection } from "@/components/college-landing/gallery-section";
import { AchievementsSection } from "@/components/college-landing/achievements-section";
import { SharingExperienceSection } from "@/components/college-landing/sharing-experience-section";
import { ReviewsSection } from "@/components/college-landing/reviews-section";
import { AmbassadorsSection } from "@/components/college-landing/ambassadors-section";
import { CtaFooter } from "@/components/college-landing/cta-footer";

interface CollegeLandingPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function CollegeLandingPage({
  params,
}: CollegeLandingPageProps) {
  const { subdomain } = await params;

  let collegeDetails;
  try {
    ({ collegeDetails } = await getCollegeBySlug(subdomain));
  } catch {
    notFound();
  }

  const [overview, courses, scholarships, gallery, reviews] = await Promise.all(
    [
      getCollegeOverviewSection(collegeDetails.id).catch(() => null),
      getCollegeCourses(subdomain).catch(() => []),
      getCollegeScholarships(subdomain).catch(() => []),
      getCollegeGallery(subdomain).catch(() => []),
      getCollegeReviews(subdomain, 6).catch(() => []),
    ],
  );

  const overviewData = overview?.data;
  const campusVisitHref = `/college/${subdomain}/campus-visit`;
  const locationText = [collegeDetails.city, collegeDetails.state]
    .filter(Boolean)
    .join(", ");
  const universityTypeName =
    collegeDetails.university?.universityType?.name ?? null;
  const currentYear = new Date().getFullYear();
  const admissionCycleLabel = `${currentYear}-${String(currentYear + 1).slice(2)}`;

  return (
    <>
      <HeroSection
        collegeName={collegeDetails.name}
        altName={overviewData?.alt_name}
        coverImageUrl={collegeDetails.coverImageUrl}
        locationText={locationText}
        universityTypeName={universityTypeName}
        establishedYear={collegeDetails.establishedYear}
        campusVisitHref={campusVisitHref}
      />

      <AboutSection
        about={overviewData?.about ?? null}
        accolades={overviewData?.accolades ?? []}
      />

      <AdmissionsCtaSection admissionCycleLabel={admissionCycleLabel} />

      <CoursesSection courses={courses} subdomain={subdomain} />

      <ScholarshipsSection scholarships={scholarships} subdomain={subdomain} />

      <AmenitiesSection
        amenities={overviewData?.amenities ?? []}
        facilities={overviewData?.inside_campus_facilities ?? []}
        locationText={locationText}
        view360Url={collegeDetails.view360Url}
      />

      <CampusHighlightsSection subdomain={subdomain} />

      <GallerySection
        gallery={gallery}
        reels={overviewData?.campus_reels ?? []}
        collegeName={collegeDetails.name}
        subdomain={subdomain}
      />

      <AchievementsSection subdomain={subdomain} />

      <SharingExperienceSection subdomain={subdomain} />

      <CampusSection
        campuses={collegeDetails.campuses}
        location={overviewData?.location}
        nearbyAccess={overviewData?.nearby_access ?? []}
      />

      <ReviewsSection reviews={reviews} />

      <AmbassadorsSection
        ambassadors={overviewData?.campus_ambassadors ?? []}
      />

      <CtaFooter
        collegeName={collegeDetails.name}
        campusVisitHref={campusVisitHref}
        social={overviewData?.social ?? []}
      />
    </>
  );
}
