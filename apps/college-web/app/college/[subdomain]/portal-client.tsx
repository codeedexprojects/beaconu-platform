"use client";

import { useState } from "react";
import {
  Building2,
  Calendar,
  Users,
  Award,
  MapPin,
  Compass,
  Briefcase,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  School,
  Bus,
  Heart,
  Search,
  GraduationCap,
  Sparkles,
  Percent,
  Bookmark,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PublicCollege } from "@/lib/services/public-college.service";

interface PortalClientProps {
  college: PublicCollege;
}

export function CollegePortalTabs({ college }: PortalClientProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "admissions" | "placements" | "tuition"
  >("overview");
  const [searchCourse, setSearchCourse] = useState("");
  const [calcScore, setCalcScore] = useState("");
  const [calcError, setCalcError] = useState<string | null>(null);
  const [calculatedConcession, setCalculatedConcession] = useState<{
    name: string;
    concession: number;
    finalPrice: number;
  } | null>(null);

  const pSections = college.profileSections || {};
  const overview = pSections.college_overview || {};
  const courseInfo = pSections.course_info || {};
  const placements = pSections.placements || {};
  const tuitionAid = pSections.tuition_and_aid || {};
  const accreditation =
    overview.accreditation_and_affiliation ||
    overview.accreditation_and_affilation ||
    {};
  const accreditationDescription = Array.isArray(accreditation)
    ? ""
    : accreditation?.description;
  const accreditationRankings = Array.isArray(accreditation)
    ? accreditation
    : Array.isArray(accreditation?.rankings)
      ? accreditation.rankings
      : [];
  const institutionDetails =
    overview.institution_details || overview.instution_details || {};
  const amenities = overview.amenities || overview.aminities || [];
  const insideCampusFacilities = overview.inside_campus_facilities || [];
  const nearbyAccess = overview.nearby_access || {};
  const utilityAccess = nearbyAccess.utilities || nearbyAccess.utility || [];
  const campusReels = overview.campus || overview.campus_reels || [];
  const connectLinks =
    overview.connectwithus?.links ||
    [
      { platform: "LinkedIn", url: overview.connect?.linkedin },
      { platform: "Instagram", url: overview.connect?.instagram },
      { platform: "Twitter", url: overview.connect?.twitter },
      { platform: "Website", url: overview.connect?.website },
    ].filter((item) => !!item.url);
  const ambassadors =
    overview.campusambassidors || college.campusAmbassadors || [];

  // Filter courses
  const filteredCourses = college.courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchCourse.toLowerCase()) ||
      course.code.toLowerCase().includes(searchCourse.toLowerCase()),
  );

  // Calculate scholarship
  const handleCalculate = () => {
    setCalcError(null);
    setCalculatedConcession(null);

    const trimmed = calcScore.trim();
    if (!trimmed) {
      setCalcError("Please enter your percentage score.");
      return;
    }

    const score = parseFloat(trimmed);
    if (isNaN(score)) {
      setCalcError("Please enter a valid numeric percentage.");
      return;
    }

    if (score < 0 || score > 100) {
      setCalcError("Percentage score must be between 0 and 100.");
      return;
    }

    if (!tuitionAid.scholarships || tuitionAid.scholarships.length === 0) {
      setCalcError("No scholarships are configured for this college.");
      return;
    }

    let bestMatch = null;
    for (const s of tuitionAid.scholarships) {
      const minCriteria = parseFloat(s.criteria);
      if (!isNaN(minCriteria) && score >= minCriteria) {
        if (
          !bestMatch ||
          parseFloat(s.concession) > parseFloat(bestMatch.concession)
        ) {
          bestMatch = s;
        }
      }
    }

    if (bestMatch) {
      const concessionPct = parseFloat(bestMatch.concession);
      const baseFee = college.courses[0]?.tuitionFee || 100000; // fallback base price
      const finalPrice = baseFee - (baseFee * concessionPct) / 100;
      setCalculatedConcession({
        name: bestMatch.name,
        concession: concessionPct,
        finalPrice,
      });
    } else {
      setCalculatedConcession({
        name: "No eligible scholarship found for this score.",
        concession: 0,
        finalPrice: college.courses[0]?.tuitionFee || 100000,
      });
    }
  };

  const getEligibilityTitle = (criterion: any) =>
    criterion?.title ||
    criterion?.studentType ||
    criterion?.label ||
    "Eligibility Info";

  const getEligibilityDescription = (criterion: any) =>
    criterion?.description || criterion?.criteria || "";

  const getEligibilityLogoSrc = (criterion: any) => {
    const rawLogo =
      typeof criterion?.logo === "string" ? criterion.logo.trim() : "";
    if (!rawLogo) {
      return null;
    }

    if (rawLogo.startsWith("<svg")) {
      return `data:image/svg+xml;utf8,${encodeURIComponent(rawLogo)}`;
    }

    if (rawLogo.startsWith("data:image/") || /^https?:\/\//i.test(rawLogo)) {
      return rawLogo;
    }

    return null;
  };

  return (
    <div className="space-y-8">
      {/* Premium Glassmorphic Tab Selector */}
      <div className="flex border-b overflow-x-auto scrollbar-none bg-background/50 backdrop-blur-md sticky top-[64px] z-30 justify-between sm:justify-start gap-1 p-1 rounded-xl border">
        {[
          { id: "overview", label: "Overview & Vibe", icon: School },
          { id: "admissions", label: "Admissions", icon: GraduationCap },
          { id: "placements", label: "Placements", icon: Briefcase },
          { id: "tuition", label: "Tuition & Aid", icon: IndianRupee },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 shrink-0 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* TAB 1: OVERVIEW & VIBE */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* About card */}
              <section className="bg-background border rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Compass className="h-5 w-5 text-primary" />
                  College Vibe & Vision
                </h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {overview.description ||
                    "Welcome to the institution. We foster innovation, deep learning, and holistic excellence."}
                </p>

                {accreditationDescription && (
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 flex items-center gap-3">
                    <Award className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        Accreditation & Affiliations
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {accreditationDescription}
                      </p>
                    </div>
                  </div>
                )}

                {accreditationRankings.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      Rankings
                    </p>
                    <div className="grid gap-2">
                      {accreditationRankings.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-lg border bg-background/60 p-3"
                        >
                          <p className="text-sm font-semibold">
                            {item.body || "Ranking Body"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.rank || "-"}
                            {item.recognitions ? ` • ${item.recognitions}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Institution statistics matrix */}
              <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    label: "Established",
                    value:
                      institutionDetails?.established_year ||
                      institutionDetails?.estd ||
                      "N/A",
                    icon: Calendar,
                  },
                  {
                    label: "Gender Type",
                    value:
                      institutionDetails?.gender_accepted ||
                      institutionDetails?.gender ||
                      "Co-Ed",
                    icon: Users,
                  },
                  {
                    label: "Campus Size",
                    value: `${institutionDetails?.campus_size || "N/A"}`,
                    icon: MapPin,
                  },
                  {
                    label: "Students Strength",
                    value:
                      institutionDetails?.average_student_count || "1,000+",
                    icon: School,
                  },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <Card
                      key={idx}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4 flex flex-col items-center text-center space-y-1">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary mb-1">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                          {stat.label}
                        </span>
                        <span className="font-bold text-base text-foreground">
                          {stat.value}
                        </span>
                      </CardContent>
                    </Card>
                  );
                })}
              </section>

              {/* Inside Campus description */}
              {overview.inside_campus?.description && (
                <section className="bg-background border rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Life Inside Campus
                  </h3>
                  <div className="grid sm:grid-cols-12 gap-6 items-center">
                    {overview.inside_campus.img && (
                      <div className="sm:col-span-4 rounded-lg overflow-hidden border max-h-40">
                        <img
                          src={overview.inside_campus.img}
                          alt="Campus Vibe"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div
                      className={
                        overview.inside_campus.img
                          ? "sm:col-span-8"
                          : "sm:col-span-12"
                      }
                    >
                      <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                        {overview.inside_campus.description}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Amenities flex list */}
              {amenities && amenities.length > 0 && (
                <section className="bg-background border rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold">Campus Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((amenity: string, idx: number) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="px-3 py-1.5 text-sm font-semibold rounded-lg"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-primary shrink-0" />
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {(nearbyAccess.transit?.length > 0 ||
                nearbyAccess.essentials?.length > 0 ||
                utilityAccess?.length > 0) && (
                <section className="bg-background border rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold">Nearby Access</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                        Transit
                      </p>
                      <div className="space-y-2">
                        {(nearbyAccess.transit || []).map(
                          (item: any, idx: number) => (
                            <p
                              key={idx}
                              className="text-sm text-muted-foreground"
                            >
                              {item.type}: {item.name} ({item.distance})
                            </p>
                          ),
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                        Essentials
                      </p>
                      <div className="space-y-2">
                        {(nearbyAccess.essentials || []).map(
                          (item: any, idx: number) => (
                            <p
                              key={idx}
                              className="text-sm text-muted-foreground"
                            >
                              {item.type}: {item.name} ({item.distance})
                            </p>
                          ),
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                        Utilities
                      </p>
                      <div className="space-y-2">
                        {(utilityAccess || []).map((item: any, idx: number) => (
                          <p
                            key={idx}
                            className="text-sm text-muted-foreground"
                          >
                            {item.type}: {item.name} ({item.distance})
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {insideCampusFacilities.length > 0 && (
                <section className="bg-background border rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold">
                    Inside Campus Facilities
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {insideCampusFacilities.map((item: any, idx: number) => (
                      <Card key={idx}>
                        <CardContent className="p-4 space-y-2">
                          <p className="font-semibold text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name || "Campus facility"}
                              className="h-28 w-full rounded-md object-cover"
                            />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {ambassadors.length > 0 && (
                <section className="bg-background border rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold">Campus Ambassadors</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {ambassadors.map((amb: any, idx: number) => (
                      <div key={idx} className="rounded-lg border p-3">
                        <p className="text-sm font-semibold">
                          {amb.name || amb.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {amb.email}
                        </p>
                        {amb.phoneNumber && (
                          <p className="text-xs text-muted-foreground">
                            {amb.phoneNumber}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {campusReels.length > 0 && (
                <section className="bg-background border rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold">Campus Reels</h3>
                  <div className="space-y-2">
                    {campusReels.map((item: any, idx: number) => (
                      <a
                        key={idx}
                        href={item.link || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-lg border p-3 text-sm hover:bg-muted/40"
                      >
                        {item.title || "Campus Short Video"}
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {connectLinks.length > 0 && (
                <section className="bg-background border rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold">Connect With Us</h3>
                  <div className="flex flex-wrap gap-2">
                    {connectLinks.map((item: any, idx: number) => (
                      <a
                        key={idx}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-lg border px-3 py-1.5 text-sm hover:bg-muted/40"
                      >
                        {item.platform}
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* TAB 2: ADMISSIONS */}
          {activeTab === "admissions" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Seat Matrix and Requirements */}
              <section className="bg-background border rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Admission Guidelines
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {courseInfo.eligibilitySummary ||
                    "Admissions are processed based on academic merit indexes and centralized cut-off assessments."}
                </p>

                {/* Eligibility requirements registry */}
                {courseInfo.eligibilityCriteria &&
                  courseInfo.eligibilityCriteria.length > 0 && (
                    <div className="space-y-3 mt-4">
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Criteria & Minimum Marks
                      </p>
                      <div className="grid gap-3">
                        {courseInfo.eligibilityCriteria.map(
                          (crit: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex gap-3 items-start bg-muted/40 border p-3 rounded-lg"
                            >
                              {getEligibilityLogoSrc(crit) ? (
                                <img
                                  src={getEligibilityLogoSrc(crit) || ""}
                                  alt={getEligibilityTitle(crit)}
                                  className="h-5 w-5 shrink-0 mt-0.5 object-contain"
                                />
                              ) : (
                                <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                              )}
                              <div>
                                <span className="font-semibold text-xs text-foreground uppercase">
                                  {getEligibilityTitle(crit)}
                                </span>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {getEligibilityDescription(crit)}
                                </p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </section>

              {/* Seat matrix details */}
              {courseInfo.seatMatrix && courseInfo.seatMatrix.length > 0 && (
                <section className="bg-background border rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold">
                    Annual Seat Matrix Distribution
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="p-3 font-semibold text-muted-foreground">
                            Category/Quota
                          </th>
                          <th className="p-3 font-semibold text-muted-foreground text-right">
                            Available Seats
                          </th>
                          <th className="p-3 font-semibold text-muted-foreground text-right font-bold text-foreground">
                            Total Matrix
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {courseInfo.seatMatrix.map((seat: any, idx: number) => (
                          <tr key={idx} className="border-b hover:bg-muted/10">
                            <td className="p-3 font-medium text-foreground">
                              {seat.quota}
                            </td>
                            <td className="p-3 text-right text-muted-foreground">
                              {seat.open} Seats
                            </td>
                            <td className="p-3 text-right font-semibold text-foreground">
                              {seat.total} Seats
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </div>
          )}

          {/* TAB 3: PLACEMENTS */}
          {activeTab === "placements" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Placements overview */}
              <section className="bg-background border rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Corporate Placement Cell
                </h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm">
                  {placements.growthSummary ||
                    "Our students enjoy an exceptional placement record with leading multinationals recruiting annually."}
                </p>

                {/* Placement key metric figures */}
                {placements.placementStats &&
                  placements.placementStats.length > 0 && (
                    <div className="grid sm:grid-cols-3 gap-4 mt-6">
                      {placements.placementStats.map(
                        (stat: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-muted/30 border border-muted p-4 rounded-xl text-center space-y-1"
                          >
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                              {stat.title}
                            </span>
                            <p className="text-xl font-black text-primary">
                              {stat.value}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  )}
              </section>

              {/* Placements salary/hiring trends */}
              {placements.placementTrends &&
                placements.placementTrends.length > 0 && (
                  <section className="bg-background border rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-bold">
                      Annual Salary packages Trend
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead>
                          <tr className="border-b bg-muted/30">
                            <th className="p-3 font-semibold text-muted-foreground">
                              Year
                            </th>
                            <th className="p-3 font-semibold text-muted-foreground text-right">
                              Average Package
                            </th>
                            <th className="p-3 font-semibold text-muted-foreground text-right font-black text-primary">
                              Highest Package
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {placements.placementTrends.map(
                            (trend: any, idx: number) => (
                              <tr
                                key={idx}
                                className="border-b hover:bg-muted/10"
                              >
                                <td className="p-3 font-medium text-foreground">
                                  {trend.year}
                                </td>
                                <td className="p-3 text-right text-muted-foreground">
                                  ₹{trend.averagePackage} LPA
                                </td>
                                <td className="p-3 text-right font-bold text-primary">
                                  ₹{trend.highestPackage} LPA
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

              {/* Notable offers */}
              {placements.notableOffers &&
                placements.notableOffers.length > 0 && (
                  <section className="bg-background border rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-bold">
                      Notable Student Placement Offers
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {placements.notableOffers.map(
                        (offer: any, idx: number) => (
                          <Card key={idx} className="hover:shadow-sm">
                            <CardContent className="p-4 flex justify-between items-start gap-4">
                              <div>
                                <p className="font-bold text-sm text-foreground">
                                  {offer.studentName}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {offer.company}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-primary font-mono text-xs shrink-0 bg-primary/5"
                              >
                                ₹{offer.package} LPA
                              </Badge>
                            </CardContent>
                          </Card>
                        ),
                      )}
                    </div>
                  </section>
                )}
            </div>
          )}

          {/* TAB 4: TUITION & AID */}
          {activeTab === "tuition" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Financial aid overview */}
              <section className="bg-background border rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-primary" />
                  Financial Assistances & Installments
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {tuitionAid.tuitionFeesSummary ||
                    "Financial programs structure provides seamless installment payouts and scholarship exemptions for brilliant minds."}
                </p>

                {/* Installments plan table */}
                {tuitionAid.installments &&
                  tuitionAid.installments.length > 0 && (
                    <div className="space-y-3 mt-6">
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Installments Schedule
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {tuitionAid.installments.map(
                          (inst: any, idx: number) => (
                            <div
                              key={idx}
                              className="border p-4 rounded-xl flex items-center justify-between bg-muted/20"
                            >
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                  Installment #{inst.installmentNo || idx + 1}
                                </span>
                                <p className="font-semibold text-sm text-foreground">
                                  {inst.dueDate
                                    ? `Due: ${inst.dueDate}`
                                    : "Course Commencement"}
                                </p>
                              </div>
                              <Badge className="font-mono text-xs">
                                {inst.percentage}% Ratio
                              </Badge>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </section>

              {/* Scholarships inventory */}
              {tuitionAid.scholarships &&
                tuitionAid.scholarships.length > 0 && (
                  <section className="bg-background border rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-bold">
                      Academic Scholarship Exemption Tiers
                    </h3>
                    <div className="grid gap-3">
                      {tuitionAid.scholarships.map((sch: any, idx: number) => (
                        <div
                          key={idx}
                          className="border p-4 rounded-xl flex justify-between items-center bg-primary/5 border-primary/10"
                        >
                          <div className="flex gap-3 items-center">
                            <Percent className="h-5 w-5 text-primary shrink-0" />
                            <div>
                              <p className="font-bold text-sm text-foreground">
                                {sch.name}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                Agg. Cut-off Index: {sch.criteria}% or higher
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant="default"
                            className="text-xs font-mono px-3 py-1 bg-primary text-primary-foreground"
                          >
                            {sch.concession}% Off
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              {/* Premium scholarship calculator widget */}
              {tuitionAid.scholarships &&
                tuitionAid.scholarships.length > 0 &&
                tuitionAid.scholarshipCalculatorEnabled !== false && (
                  <section className="bg-background border border-primary/20 rounded-xl p-6 shadow-md space-y-4 relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none"></div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Interactive Scholarship Calculator
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Provide your qualifying board exam percentage to check
                      potential financial waivers dynamically.
                    </p>

                    <div className="flex flex-col gap-2 max-w-sm">
                      <div className="flex gap-3">
                        <Input
                          type="number"
                          placeholder="e.g. 96"
                          value={calcScore}
                          onChange={(e) => {
                            setCalcScore(e.target.value);
                            if (calcError) setCalcError(null);
                          }}
                          className={`text-sm font-semibold ${calcError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                        <Button
                          onClick={handleCalculate}
                          className="font-bold shrink-0"
                        >
                          Calculate
                        </Button>
                      </div>
                      {calcError && (
                        <p className="text-xs font-semibold text-destructive mt-0.5">
                          {calcError}
                        </p>
                      )}
                    </div>

                    {calculatedConcession && (
                      <div className="bg-muted p-4 rounded-lg animate-in slide-in-from-top-2 duration-200">
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                          Estimated exemption results
                        </p>
                        {calculatedConcession.concession > 0 ? (
                          <div className="mt-2 space-y-1">
                            <p className="font-bold text-foreground text-sm">
                              {calculatedConcession.name}
                            </p>
                            <p className="text-lg font-black text-primary">
                              {calculatedConcession.concession}% Waiver
                              Qualified!
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Estimated Course Tuition Fee:{" "}
                              <span className="font-mono line-through">
                                ₹{college.courses[0]?.tuitionFee || 100000}
                              </span>{" "}
                              &rarr;{" "}
                              <span className="font-black text-foreground text-sm font-mono">
                                ₹{calculatedConcession.finalPrice}
                              </span>
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-amber-700 font-semibold mt-2">
                            {calculatedConcession.name}
                          </p>
                        )}
                      </div>
                    )}
                  </section>
                )}
            </div>
          )}
        </div>

        {/* Dynamic Sidebar Course Search */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                Filter Program Courses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                placeholder="Search program names..."
                value={searchCourse}
                onChange={(e) => setSearchCourse(e.target.value)}
                className="text-sm font-medium"
              />

              <div className="space-y-3">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-3 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-semibold text-xs text-foreground line-clamp-1">
                        {course.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] shrink-0 font-mono"
                      >
                        {course.code}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">
                      {course.discipline.name} • {course.programType.name}
                    </p>
                    {course.tuitionFee && (
                      <p className="text-xs font-semibold text-primary font-mono mt-1">
                        ₹{course.tuitionFee} base annual fee
                      </p>
                    )}
                  </div>
                ))}
                {filteredCourses.length === 0 && (
                  <p className="text-xs text-center text-muted-foreground py-4">
                    No matching academic courses found.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick campus locations */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Transit & Nearby Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {overview.nearby_access?.transit &&
                overview.nearby_access.transit.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Bus className="h-3 w-3" /> Transit Station Links
                    </p>
                    {overview.nearby_access.transit.map(
                      (t: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-xs p-2.5 bg-muted/40 rounded-lg"
                        >
                          <div>
                            <p className="font-semibold text-foreground">
                              {t.name}
                            </p>
                            <span className="text-[10px] text-muted-foreground uppercase">
                              {t.type} access
                            </span>
                          </div>
                          <Badge variant="outline" className="font-mono">
                            {t.distance} km
                          </Badge>
                        </div>
                      ),
                    )}
                  </div>
                )}

              {overview.nearby_access?.essentials &&
                overview.nearby_access.essentials.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Heart className="h-3 w-3" /> Essential Services
                    </p>
                    {overview.nearby_access.essentials.map(
                      (e: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-xs p-2.5 bg-muted/40 rounded-lg"
                        >
                          <div>
                            <p className="font-semibold text-foreground">
                              {e.name}
                            </p>
                            <span className="text-[10px] text-muted-foreground uppercase">
                              {e.type} access
                            </span>
                          </div>
                          <Badge variant="outline" className="font-mono">
                            {e.distance} km
                          </Badge>
                        </div>
                      ),
                    )}
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
