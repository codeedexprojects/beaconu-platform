import { notFound } from "next/navigation";
import {
  getCollegeBySlug,
  getCollegeCourses,
  getCollegeGallery,
  getCollegeOverviewSection,
  getCollegeReviews,
  getCollegeScholarships,
  getHappeningsSection,
} from "@/lib/services/public-college.service";
import { HeroSection } from "@/components/college-landing/hero-section";
import { AboutSection } from "@/components/college-landing/about-section";
import { CampusStatsBand } from "@/components/college-landing/campus-stats-band";
import { AdmissionsCtaSection } from "@/components/college-landing/admissions-cta-section";
import { AmenitiesSection } from "@/components/college-landing/amenities-section";
import { CampusHighlightsSection } from "@/components/college-landing/campus-highlights-section";
import { CoursesSection } from "@/components/college-landing/courses-section";
import { ScholarshipsSection } from "@/components/college-landing/scholarships-section";
import { OurStoriesSection } from "@/components/college-landing/our-stories-section";
import { GallerySection } from "@/components/college-landing/gallery-section";
import { AchievementsSection } from "@/components/college-landing/achievements-section";
import { SharingExperienceSection } from "@/components/college-landing/sharing-experience-section";
import { ReviewsSection } from "@/components/college-landing/reviews-section";
import { AmbassadorsSection } from "@/components/college-landing/ambassadors-section";
import { CtaFooter } from "@/components/college-landing/cta-footer";
import { SiteFooter } from "@/components/college-landing/site-footer";

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

  const [overview, courses, scholarships, gallery, reviews, happenings] =
    await Promise.all([
      getCollegeOverviewSection(collegeDetails.id).catch(() => null),
      getCollegeCourses(subdomain).catch(() => []),
      getCollegeScholarships(subdomain).catch(() => []),
      getCollegeGallery(subdomain).catch(() => []),
      getCollegeReviews(subdomain, 6).catch(() => []),
      getHappeningsSection(collegeDetails.id).catch(() => null),
    ]);

  const overviewData = overview?.data;
  const campusHighlights = (happenings?.data?.happenings ?? [])
    .slice(0, 6)
    .map((item, i) => ({
      id: `happening-${i}`,
      tag: item.category || "Campus News",
      title: item.title || "Untitled",
      excerpt: item.description || "",
      imageUrl: item.image ?? null,
      href: item.link,
    }));
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
        imageUrl={overviewData?.about_image ?? null}
      />

      <CampusStatsBand
        stats={(overviewData?.campus_stats ?? []).map((item) => ({
          label: item.label ?? "",
          value: item.value ?? "",
        }))}
        backgroundImageUrl={collegeDetails.coverImageUrl}
      />

      <AdmissionsCtaSection
        admissionCycleLabel={admissionCycleLabel}
        imageUrl={overviewData?.admissions_cta_image ?? null}
      />

      <CoursesSection courses={courses} subdomain={subdomain} />

      <ScholarshipsSection scholarships={scholarships} subdomain={subdomain} />

      <AmenitiesSection
        amenities={overviewData?.amenities ?? []}
        facilities={overviewData?.inside_campus_facilities ?? []}
        locationText={locationText}
        view360Url={collegeDetails.view360Url}
      />

      <CampusHighlightsSection
        subdomain={subdomain}
        highlights={campusHighlights}
      />

      <OurStoriesSection
        reels={overviewData?.campus_reels ?? []}
        collegeName={collegeDetails.name}
      />

      <AchievementsSection
        subdomain={subdomain}
        achievements={(overviewData?.achievements ?? []).map((item, i) => ({
          id: `achievement-${i}`,
          title: item.title || "Untitled",
          subtitle: item.subtitle,
          imageUrl: item.image ?? null,
        }))}
      />

      <SharingExperienceSection
        subdomain={subdomain}
        testimonials={(overviewData?.testimonials ?? []).map((item, i) => ({
          id: `testimonial-${i}`,
          quote: item.quote || "",
          name: item.name || "Anonymous",
          roleLines: item.role_lines ?? [],
          avatarUrl: item.image ?? null,
        }))}
      />

      <GallerySection gallery={gallery} subdomain={subdomain} />

      <ReviewsSection reviews={reviews} />

      <AmbassadorsSection
        ambassadors={overviewData?.campus_ambassadors ?? []}
      />

      <CtaFooter
        collegeName={collegeDetails.name}
        campusVisitHref={campusVisitHref}
      />

      <SiteFooter
        collegeName={collegeDetails.name}
        logoUrl={collegeDetails.logoUrl}
        subdomain={subdomain}
        address={
          overviewData?.location?.address ||
          [collegeDetails.address, collegeDetails.city, collegeDetails.state]
            .filter(Boolean)
            .join(", ")
        }
        mapLink={overviewData?.location?.map_link}
        social={overviewData?.social ?? []}
      />
    </>
  );
}
