import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calendar,
  GraduationCap,
  Landmark,
  MapPin,
  Trophy,
  Network,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { publicCollegeService } from "@/lib/services/public-college.service";

interface CollegeLandingPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function CollegeLandingPage({
  params,
}: CollegeLandingPageProps) {
  const { subdomain } = await params;

  let college;
  try {
    college = await publicCollegeService.getBySlug(subdomain);
  } catch {
    notFound();
  }

  const campuses = Array.isArray(college.campuses) ? college.campuses : [];
  const courses = Array.isArray(college.courses) ? college.courses : [];

  const mainCampus = campuses.find((c) => c.isMainCampus) || campuses[0];
  const aboutText =
    college.profileSections?.college_overview?.description ||
    "Experience a future-ready campus designed for innovation, creativity, and academic excellence.";
  const featuredCourses = courses.slice(0, 6);
  const universityType =
    college.university?.universityType?.name || "University";
  const locationText = [college.city, college.state].filter(Boolean).join(", ");

  let affiliatedColleges: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    city: string | null;
    state: string | null;
  }[] = [];

  if (college.institutionGroups && college.institutionGroups.length > 0) {
    affiliatedColleges = college.institutionGroups[0].members
      .filter((m) => m.college.id !== college.id)
      .map((m) => m.college);
  } else if (college.institutionGroupMember?.group) {
    affiliatedColleges = college.institutionGroupMember.group.members
      .filter((m) => m.college.id !== college.id)
      .map((m) => m.college);
  }

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-[#1b1b1b] [font-family:Poppins,ui-sans-serif,system-ui]">
      <header className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 rounded-[30px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
              {college.logoUrl ? (
                <img
                  src={college.logoUrl}
                  alt={`${college.name} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Building2 className="h-7 w-7 text-slate-400" />
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold leading-tight text-[#1f2937] sm:text-3xl">
                {college.name}
              </h1>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <span className="h-px w-10 bg-slate-300" />
                <span>
                  ESTD{" "}
                  {college.profileSections?.college_overview?.instution_details
                    ?.estd || "2023"}
                </span>
                <span className="h-px w-10 bg-slate-300" />
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-2 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            {[
              ["Institutions", "#campuses"],
              ["Courses", "#courses"],
              ["Scholarships", "#scholarships"],
              ["Placements", "#placements"],
              ["Admission", "#admission"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-200">
          {college.coverImageUrl ? (
            <img
              src={college.coverImageUrl}
              alt={`${college.name} cover`}
              className="h-[380px] w-full object-cover sm:h-[460px]"
            />
          ) : (
            <div className="h-[380px] w-full bg-gradient-to-r from-[#182848] to-[#4b6cb7] sm:h-[460px]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="absolute bottom-6 left-6 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-white/60" />
            <span className="h-3 w-3 rounded-full bg-white" />
            <span className="h-2 w-2 rounded-full bg-white/60" />
            <span className="h-2 w-2 rounded-full bg-white/60" />
          </div>
        </div>

        <div id="admission" className="mt-8 flex justify-center">
          <Link href={`/college/${subdomain}/login`}>
            <Button className="h-12 rounded-full bg-[#f97316] px-8 text-base font-semibold text-white hover:bg-[#ea5f05]">
              Start Admission
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-16 px-4 pb-20 sm:px-6 lg:px-8">
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <Landmark className="mx-auto mb-3 h-7 w-7 text-[#f97316]" />
            <p className="text-sm text-slate-500">University Type</p>
            <p className="mt-1 text-base font-semibold text-slate-800">
              {universityType}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <MapPin className="mx-auto mb-3 h-7 w-7 text-[#f97316]" />
            <p className="text-sm text-slate-500">Location</p>
            <p className="mt-1 text-base font-semibold text-slate-800">
              {locationText || "Location not specified"}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-center text-3xl font-bold text-[#111827]">
            About the Campus
          </h2>
          <p className="mx-auto mt-4 max-w-4xl text-center text-lg leading-8 text-slate-500">
            {aboutText}
          </p>
          {mainCampus ? (
            <div className="mt-6 flex justify-center">
              <Badge className="rounded-full bg-[#111827] px-5 py-2 text-xs font-semibold text-white hover:bg-[#111827]">
                Main Campus: {mainCampus.name}
              </Badge>
            </div>
          ) : null}
        </section>

        {affiliatedColleges.length > 0 && (
          <section
            id="campuses"
            className="rounded-[34px] border border-slate-200 bg-white p-6 sm:p-10 shadow-sm"
          >
            <div className="mb-8 text-center">
              <h3 className="text-3xl font-bold text-[#1A2B44] flex items-center justify-center gap-2">
                <Network className="h-7 w-7 text-[#f97316]" />
                Group of Institutions
              </h3>
              <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
                We are part of a larger network of excellence. Explore our
                sister institutions.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {affiliatedColleges.map((affiliate) => (
                <Link
                  key={affiliate.id}
                  href={`/college/${affiliate.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:bg-white hover:shadow-md"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100">
                    {affiliate.logoUrl ? (
                      <img
                        src={affiliate.logoUrl}
                        alt={`${affiliate.name} logo`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100">
                        <Building2 className="h-5 w-5 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-slate-900 group-hover:text-[#f97316] transition-colors">
                      {affiliate.name}
                    </h4>
                    <p className="truncate text-xs text-slate-500">
                      {[affiliate.city, affiliate.state]
                        .filter(Boolean)
                        .join(", ") || "Location TBA"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section
          id="courses"
          className="rounded-[34px] bg-[#fff7ef] p-6 sm:p-10"
        >
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-3xl font-bold text-[#1A2B44]">
                Explore Courses & Programs
              </h3>
              <p className="mt-2 text-slate-600">
                Discover programs designed for future-ready careers.
              </p>
            </div>
            <Badge
              variant="outline"
              className="w-fit rounded-full border-orange-200 bg-white px-4 py-2 text-orange-600"
            >
              {featuredCourses.length} Featured Courses
            </Badge>
          </div>

          {featuredCourses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {featuredCourses.map((course) => (
                <article
                  key={course.id}
                  className="rounded-3xl border border-[#ffd9bf] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
                >
                  <div className="mb-4 flex items-center justify-between text-xs">
                    <Badge className="rounded-full bg-[#04162E0D] px-3 py-1 font-semibold text-[#1A2B44] hover:bg-[#04162E0D]">
                      {course.studyLevel?.name || "Program"}
                    </Badge>
                    <span className="text-slate-500">
                      {course.durationMonths
                        ? `${Math.round(course.durationMonths / 12)} Years`
                        : "Duration TBA"}
                    </span>
                  </div>

                  <h4 className="min-h-[52px] text-base font-semibold leading-6 text-[#1A2B44]">
                    {course.name}
                  </h4>

                  <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
                    <span>{course.code}</span>
                    <span>{course.discipline?.name || "Discipline"}</span>
                  </div>

                  <button className="mt-5 rounded-xl border border-slate-200 px-4 py-2 text-sm text-[#F46A12] transition hover:bg-orange-50">
                    Learn More
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-8 text-center text-slate-500">
              Courses will be published soon.
            </div>
          )}
        </section>

        <section
          id="scholarships"
          className="rounded-[34px] bg-[#f8f9fa] p-6 sm:p-10"
        >
          <h3 className="text-center text-3xl font-bold text-[#191C1D]">
            Scholarships & Financial Support
          </h3>
          <p className="mx-auto mt-3 max-w-3xl text-center text-slate-600">
            Helping students achieve their dreams with quality education
            support.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              [
                "Merit Scholarships",
                "High academic performers receive exclusive tuition benefits.",
              ],
              [
                "Need Assistance",
                "Financial aid programs for diverse economic backgrounds.",
              ],
              [
                "Sports Scholarships",
                "Dedicated support for exceptional athletes.",
              ],
              [
                "Innovation Grants",
                "Funding for student research and technology projects.",
              ],
            ].map(([title, desc]) => (
              <article
                key={title}
                className="rounded-3xl border border-[#edeeef] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
              >
                <div className="mb-3 h-11 w-11 rounded-2xl bg-orange-100" />
                <h4 className="text-lg font-semibold text-[#191C1D]">
                  {title}
                </h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="placements"
          className="rounded-[34px] bg-white p-6 sm:p-10"
        >
          <h3 className="text-center text-3xl font-bold text-[#f46a12]">
            Placement Excellence
          </h3>
          <p className="mx-auto mt-3 max-w-3xl text-center text-slate-600">
            Our graduates are in high demand across top organizations.
          </p>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <article className="rounded-3xl border border-[#edeeef] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">Highest Package</p>
                  <p className="mt-1 text-3xl font-bold text-[#0031E3]">
                    ₹
                    {college.profileSections?.placements?.highestPackage ||
                      "18L"}
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-amber-500" />
              </div>
              <p className="mt-4 text-sm text-slate-600">
                Year-on-year growth with strong recruiter trust and student
                outcomes.
              </p>
            </article>

            <article className="rounded-3xl border border-[#edeeef] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">Recruiting Partners</p>
                  <p className="mt-1 text-3xl font-bold text-[#111827]">450+</p>
                </div>
                <GraduationCap className="h-8 w-8 text-[#f46a12]" />
              </div>
              <p className="mt-4 text-sm text-slate-600">
                Global and national companies actively hire from the campus each
                year.
              </p>
            </article>
          </div>
        </section>

        <section className="overflow-hidden rounded-[36px] bg-gradient-to-b from-[#ff7a1a] to-[#9c4500] p-8 text-white sm:p-12">
          <div className="mx-auto max-w-4xl text-center">
            <h3 className="text-3xl font-bold sm:text-4xl">
              Begin Your Admission Journey
            </h3>
            <p className="mt-4 text-lg text-white/90">
              Your future self will thank you. Take the first step today and
              join the next class.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={`/college/${subdomain}/login`}>
                <Button className="h-12 rounded-full bg-white px-7 text-base font-semibold text-[#F46A12] hover:bg-white/90">
                  Start Admission <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="h-12 rounded-full border-white/70 bg-transparent px-7 text-base text-white hover:bg-white/10"
              >
                Download Brochure
              </Button>
            </div>
          </div>
        </section>

        <footer className="rounded-3xl border border-slate-200 bg-white p-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h4 className="text-lg font-semibold text-slate-800">
                {college.name}
              </h4>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Empowering students through innovative education, modern
                facilities, and a community focused on future success.
              </p>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-slate-900">
                Quick Links
              </h5>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                <li>Contact Support</li>
                <li>Privacy Policy</li>
                <li>Campus Map</li>
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-slate-900">
                Admissions
              </h5>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                <li>Admissions Office</li>
                <li>Scholarships</li>
                <li>Fees & Funding</li>
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-slate-900">Identity</h5>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Code: {college.code}
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />{" "}
                  {locationText || "City pending"}
                </li>
                <li className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />{" "}
                  {college.university?.name || "University pending"}
                </li>
              </ul>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
