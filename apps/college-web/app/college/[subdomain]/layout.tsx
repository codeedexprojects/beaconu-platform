import { notFound } from "next/navigation";
import { getCollegeBySlug } from "@/lib/services/public-college.service";
import { SiteNav } from "@/components/college-landing/site-nav";

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
  { id: "about", label: "About" },
  { id: "courses", label: "Courses" },
  { id: "campus", label: "Campus" },
  { id: "scholarships", label: "Scholarships" },
  { id: "gallery", label: "Gallery" },
  { id: "reviews", label: "Reviews" },
  { id: "ambassadors", label: "Ambassadors" },
];

// Standalone feature pages, not gated by the college_overview tabs list.
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
  } catch {
    notFound();
  }

  const homeHref = `/college/${subdomain}`;
  const applyHref = `${homeHref}/login`;

  const coreLinks = CORE_SECTIONS.map((section) => ({
    id: section.id,
    label: section.label,
    href: `${homeHref}#${section.id}`,
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
        applyHref={applyHref}
        sections={coreLinks}
        moreSections={[...tabLinks, ...extraLinks]}
      />
      {children}
    </div>
  );
}
