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
import { StatsStrip } from "@/components/college-landing/stats-strip";
import { AboutSection } from "@/components/college-landing/about-section";
import { AmenitiesSection } from "@/components/college-landing/amenities-section";
import { CoursesSection } from "@/components/college-landing/courses-section";
import { CampusSection } from "@/components/college-landing/campus-section";
import { ScholarshipsSection } from "@/components/college-landing/scholarships-section";
import { GallerySection } from "@/components/college-landing/gallery-section";
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
  const applyHref = `/college/${subdomain}/login`;
  const campusVisitHref = `/college/${subdomain}/campus-visit`;
  const locationText = [collegeDetails.city, collegeDetails.state]
    .filter(Boolean)
    .join(", ");
  const universityTypeName =
    collegeDetails.university?.universityType?.name ?? null;

  const stats = [
    collegeDetails.establishedYear && {
      label: "Established",
      value: String(collegeDetails.establishedYear),
    },
    collegeDetails.avgStudentCount && {
      label: "Students",
      value: `${collegeDetails.avgStudentCount}+`,
    },
    collegeDetails.campusSizeAcres && {
      label: "Campus Size",
      value: `${collegeDetails.campusSizeAcres} acres`,
    },
    courses.length > 0 && {
      label: "Programs Offered",
      value: String(courses.length),
    },
  ].filter((s): s is { label: string; value: string } => Boolean(s));

  return (
    <>
      <HeroSection
        collegeName={collegeDetails.name}
        altName={overviewData?.alt_name}
        coverImageUrl={collegeDetails.coverImageUrl}
        locationText={locationText}
        universityTypeName={universityTypeName}
        establishedYear={collegeDetails.establishedYear}
        applyHref={applyHref}
        campusVisitHref={campusVisitHref}
      />

      <StatsStrip
        stats={stats}
        avgRating={collegeDetails.avgRating}
        reviewCount={collegeDetails.reviewCount}
      />

      <AboutSection
        about={overviewData?.about ?? null}
        accolades={overviewData?.accolades ?? []}
      />

      <AmenitiesSection
        amenities={overviewData?.amenities ?? []}
        facilities={overviewData?.inside_campus_facilities ?? []}
      />

      <CoursesSection courses={courses} subdomain={subdomain} />

      <CampusSection
        campuses={collegeDetails.campuses}
        location={overviewData?.location}
        nearbyAccess={overviewData?.nearby_access ?? []}
      />

      <ScholarshipsSection scholarships={scholarships} />

      <GallerySection
        gallery={gallery}
        reels={overviewData?.campus_reels ?? []}
      />

      <ReviewsSection reviews={reviews} />

      <AmbassadorsSection
        ambassadors={overviewData?.campus_ambassadors ?? []}
      />

      <CtaFooter
        collegeName={collegeDetails.name}
        applyHref={applyHref}
        campusVisitHref={campusVisitHref}
        social={overviewData?.social ?? []}
      />
    </>
  );
}
