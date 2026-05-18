import { notFound } from "next/navigation";
import { MapPin, BookOpen, GraduationCap, Building2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  const mainCampus =
    college.campuses.find((c) => c.isMainCampus) || college.campuses[0];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header/Hero Section */}
      <header className="bg-background border-b relative overflow-hidden">
        {college.coverImageUrl ? (
          <div className="h-64 md:h-80 w-full overflow-hidden">
            <img
              src={college.coverImageUrl}
              alt={`${college.name} cover`}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-32 md:h-48 w-full bg-gradient-to-r from-primary/80 to-primary/60" />
        )}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 sm:-mt-24 pb-8 flex flex-col md:flex-row md:items-end gap-6">
            <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-xl bg-background border-4 border-background shadow-md overflow-hidden flex items-center justify-center shrink-0">
              {college.logoUrl ? (
                <img
                  src={college.logoUrl}
                  alt={`${college.name} logo`}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <Building2 className="h-16 w-16 text-muted-foreground/50" />
              )}
            </div>

            <div className="flex-1 pb-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                {college.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-3 text-muted-foreground text-sm sm:text-base">
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="font-mono bg-background">
                    {college.code}
                  </Badge>
                </div>
                {mainCampus && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>
                      {mainCampus.city}, {mainCampus.state}
                    </span>
                  </div>
                )}
                {college.university && (
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 shrink-0" />
                    <span>{college.university.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-12">
            {/* About Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6">About the College</h2>
              <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground leading-relaxed bg-background p-6 rounded-xl border shadow-sm">
                <p>
                  Welcome to the official portal of {college.name}. This
                  institution is dedicated to academic excellence and holistic
                  student development.
                  {mainCampus &&
                    ` Our primary campus is located in the vibrant city of ${mainCampus.city}, ${mainCampus.state}.`}
                </p>
                <p className="mt-4">
                  Explore our wide range of academic programs, state-of-the-art
                  facilities, and experienced faculty committed to shaping the
                  leaders of tomorrow.
                </p>
              </div>
            </section>

            {/* Courses Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Academic Programs</h2>
                <Badge variant="secondary" className="px-3 py-1 text-sm">
                  {college.courses.length} Courses
                </Badge>
              </div>

              {college.courses.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {college.courses.map((course) => (
                    <Card
                      key={course.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <h3 className="font-semibold leading-tight line-clamp-2">
                            {course.name}
                          </h3>
                          <Badge variant="outline" className="shrink-0">
                            {course.code}
                          </Badge>
                        </div>

                        <div className="space-y-2 mt-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span className="font-medium text-foreground">
                              {course.discipline.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 shrink-0" />
                            <span>
                              {course.studyLevel.name} •{" "}
                              {course.programType.name}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t mt-3">
                            <span className="capitalize">
                              {course.studyMode.replace("_", " ")}
                            </span>
                            {course.durationMonths && (
                              <span className="font-medium">
                                {course.durationMonths} Months
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-background rounded-xl border border-dashed">
                  <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <h3 className="text-lg font-medium">No courses listed</h3>
                  <p className="text-muted-foreground">
                    {"This college hasn't added any public courses yet."}
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campuses Widget */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Campuses & Locations
                </h3>
                <div className="space-y-4">
                  {college.campuses.map((campus) => (
                    <div
                      key={campus.id}
                      className="p-3 bg-muted/40 rounded-lg border"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium text-sm">{campus.name}</h4>
                        {campus.isMainCampus && (
                          <Badge
                            variant="default"
                            className="text-[10px] px-1.5 py-0"
                          >
                            Main
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                        {[
                          campus.address,
                          campus.city,
                          campus.state,
                          campus.pinCode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Info Widget */}
            {college.university && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Affiliation
                  </h3>
                  <div className="flex items-center gap-3">
                    {college.university.logoUrl ? (
                      <img
                        src={college.university.logoUrl}
                        alt=""
                        className="h-10 w-10 object-contain rounded border"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-muted rounded flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium leading-tight">
                        {college.university.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                        {college.university.universityType?.name ??
                          "University"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
