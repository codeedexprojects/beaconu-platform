import { notFound } from "next/navigation";
import { getCollegeBySlug } from "@/lib/services/public-college.service";
import { SiteNav } from "@/components/college-landing/site-nav";

// Without this, a single transient failure to reach the API (e.g. a slow
// Render cold start) gets baked into Next's route cache as a permanent
// notFound() for that path, since api.get()'s plain fetch() defaults to
// force-cache and this segment has no other opt-out.
export const dynamic = "force-dynamic";

const TAB_ROUTES: Record<string, { label: string; path: string }> = {
  institutions_across_world: { label: "Institutions", path: "institutions" },
  commute: { label: "Commute", path: "commute" },
  happenings: { label: "Happenings", path: "happenings" },
  student_code_of_conduct: {
    label: "Code of Conduct",
    path: "code-of-conduct",
  },
};

const CORE_SECTIONS = [
  { id: "about", label: "About", anchor: "about" },
  { id: "courses", label: "Courses", anchor: "courses" },
  { id: "scholarships", label: "Scholarships", anchor: "scholarships" },
  { id: "campus", label: "Facilities", anchor: "campus" },
  { id: "highlights", label: "Highlights", anchor: "highlights" },
  { id: "our-stories", label: "Our Stories", anchor: "our-stories" },
  { id: "achievements", label: "Achievements", anchor: "achievements" },
  { id: "gallery", label: "Gallery", anchor: "gallery" },
  { id: "reviews", label: "Reviews", anchor: "sharing-experience" },
  { id: "ambassadors", label: "Ambassadors", anchor: "ambassadors" },
];

const EXTRA_LINKS = [
  { id: "hostels", label: "Hostels", path: "hostels" },
  { id: "libraries", label: "Libraries", path: "libraries" },
];

interface CollegeLayoutProps {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}

export default async function CollegeLayout({
  children,
  params,
}: CollegeLayoutProps) {
  const { subdomain } = await params;

  let collegeDetails;
  let tabs;
  try {
    ({ collegeDetails, tabs } = await getCollegeBySlug(subdomain));
  } catch (error) {
    console.error("[CollegeLayout] getCollegeBySlug failed:", error);
    notFound();
  }

  const homeHref = `/college/${subdomain}`;

  const coreLinks = CORE_SECTIONS.map((section) => ({
    id: section.id,
    label: section.label,
    href: `${homeHref}#${section.anchor}`,
  }));

  const tabLinks = tabs
    .filter((tab) => TAB_ROUTES[tab.id])
    .map((tab) => {
      const route = TAB_ROUTES[tab.id];
      return {
        id: tab.id,
        label: route.label,
        href: `${homeHref}/${route.path}`,
      };
    });

  const extraLinks = EXTRA_LINKS.map((link) => ({
    id: link.id,
    label: link.label,
    href: `${homeHref}/${link.path}`,
  }));

  return (
    <div className="min-h-screen bg-background">
      <SiteNav
        collegeName={collegeDetails.name}
        logoUrl={collegeDetails.logoUrl}
        sections={coreLinks}
        moreSections={[...tabLinks, ...extraLinks]}
      />
      {children}
    </div>
  );
}
