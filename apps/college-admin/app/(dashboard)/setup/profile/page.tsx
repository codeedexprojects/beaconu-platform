"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  ArrowRight,
  Building,
  Award,
  BookOpen,
  DollarSign,
  GraduationCap,
  Plus,
  Trash2,
  Globe,
  PlusCircle,
  Play,
  Users,
  Compass,
  MapPin,
  TrendingUp,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import {
  useCollegeProfile,
  useUpdateCollegeProfile,
} from "@/hooks/use-colleges";
import { getCollegeSlugFromPath, getPortalPath } from "@/lib/portal-path";

// Define a unified form schema supporting Basic info & complex profileSections
const profileFormSchema = z.object({
  name: z.string().min(2, "College name is required"),
  code: z.string().min(2, "College code is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  district: z.string().min(2, "District is required"),
  pinCode: z.string().min(6, "Valid PIN code is required"),
  logoUrl: z
    .string()
    .url("Enter a valid logo URL")
    .optional()
    .or(z.literal("")),
  coverImageUrl: z
    .string()
    .url("Enter a valid cover image URL")
    .optional()
    .or(z.literal("")),

  // profileSections fields
  profileSections: z.object({
    college_overview: z.object({
      description: z.string().default(""),
      accreditation_and_affilation: z.object({
        img: z.string().default(""),
        description: z.string().default(""),
      }),
      instution_details: z.object({
        estd: z.string().default(""),
        gender: z.string().default("Co-Ed"),
        average_student_count: z.string().default(""),
        campus_size: z.string().default(""),
        Student_from_outside: z.string().default(""),
      }),
      inside_campus: z.object({
        img: z.string().default(""),
        description: z.string().default(""),
      }),
      location: z.object({
        map_link: z.string().default(""),
      }),
      connect: z.object({
        linkedin: z.string().default(""),
        instagram: z.string().default(""),
        twitter: z.string().default(""),
        website: z.string().default(""),
      }),
    }),
    course_info: z.object({
      eligibilitySummary: z.string().default(""),
    }),
    placements: z.object({
      placementReportUrl: z.string().default(""),
      growthSummary: z.string().default(""),
    }),
    tuition_and_aid: z.object({
      tuitionFeesSummary: z.string().default(""),
      scholarshipCalculatorEnabled: z.boolean().default(false),
    }),
  }),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

const PREDEFINED_AMENITIES = [
  "Wi-Fi Campus",
  "Library",
  "Swimming Pool",
  "Sports Complex",
  "Gymnasium",
  "AC Classrooms",
  "Computer Lab",
  "Hostel Facility",
  "Cafeteria",
  "Auditorium",
];

export default function SetupProfilePage() {
  const router = useRouter();
  const collegeSlug =
    typeof window === "undefined"
      ? null
      : getCollegeSlugFromPath(window.location.pathname, window.location.host);

  const { data: profile, isLoading } = useCollegeProfile();
  const { mutate: updateProfile, isPending } = useUpdateCollegeProfile();

  const [activeTab, setActiveTab] = useState<
    "basic" | "overview" | "admissions" | "placements" | "fees"
  >("basic");

  // State to hold dynamic JSON fields not easily mapped in standard zod/rhf fields
  const [amenities, setAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState("");

  const [transitAccess, setTransitAccess] = useState<
    { type: string; name: string; distance: string }[]
  >([]);
  const [essentialsAccess, setEssentialsAccess] = useState<
    { type: string; name: string; distance: string }[]
  >([]);
  const [campusReels, setCampusReels] = useState<
    { title: string; link: string }[]
  >([]);

  const [seatMatrix, setSeatMatrix] = useState<
    { quota: string; total: string; open: string }[]
  >([]);
  const [eligibilityCriteria, setEligibilityCriteria] = useState<
    { studentType: string; criteria: string }[]
  >([]);

  const [placementStats, setPlacementStats] = useState<
    { title: string; value: string }[]
  >([]);
  const [placementTrends, setPlacementTrends] = useState<
    { year: string; averagePackage: string; highestPackage: string }[]
  >([]);
  const [notableOffers, setNotableOffers] = useState<
    { studentName: string; company: string; package: string }[]
  >([]);

  const [additionalFees, setAdditionalFees] = useState<
    { name: string; amount: string; frequency: string }[]
  >([]);
  const [installmentSchedule, setInstallmentSchedule] = useState<
    { installmentNo: string; dueDate: string; percentage: string }[]
  >([]);
  const [scholarshipsList, setScholarshipsList] = useState<
    { name: string; concession: string; criteria: string }[]
  >([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      profileSections: {
        college_overview: {
          description: "",
          accreditation_and_affilation: { img: "", description: "" },
          instution_details: {
            estd: "",
            gender: "Co-Ed",
            average_student_count: "",
            campus_size: "",
            Student_from_outside: "",
          },
          inside_campus: { img: "", description: "" },
          location: { map_link: "" },
          connect: { linkedin: "", instagram: "", twitter: "", website: "" },
        },
        course_info: { eligibilitySummary: "" },
        placements: { placementReportUrl: "", growthSummary: "" },
        tuition_and_aid: {
          tuitionFeesSummary: "",
          scholarshipCalculatorEnabled: false,
        },
      },
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || "",
        code: profile.code || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        district: profile.district || "",
        pinCode: profile.pinCode || "",
        logoUrl: profile.logoUrl || "",
        coverImageUrl: profile.coverImageUrl || "",
        profileSections: {
          college_overview: {
            description:
              profile.profileSections?.college_overview?.description || "",
            accreditation_and_affilation: {
              img:
                profile.profileSections?.college_overview
                  ?.accreditation_and_affilation?.img || "",
              description:
                profile.profileSections?.college_overview
                  ?.accreditation_and_affilation?.description || "",
            },
            instution_details: {
              estd:
                profile.profileSections?.college_overview?.instution_details
                  ?.estd || "",
              gender:
                profile.profileSections?.college_overview?.instution_details
                  ?.gender || "Co-Ed",
              average_student_count:
                profile.profileSections?.college_overview?.instution_details
                  ?.average_student_count || "",
              campus_size:
                profile.profileSections?.college_overview?.instution_details
                  ?.campus_size || "",
              Student_from_outside:
                profile.profileSections?.college_overview?.instution_details
                  ?.Student_from_outside || "",
            },
            inside_campus: {
              img:
                profile.profileSections?.college_overview?.inside_campus?.img ||
                "",
              description:
                profile.profileSections?.college_overview?.inside_campus
                  ?.description || "",
            },
            location: {
              map_link:
                profile.profileSections?.college_overview?.location?.map_link ||
                "",
            },
            connect: {
              linkedin:
                profile.profileSections?.college_overview?.connect?.linkedin ||
                "",
              instagram:
                profile.profileSections?.college_overview?.connect?.instagram ||
                "",
              twitter:
                profile.profileSections?.college_overview?.connect?.twitter ||
                "",
              website:
                profile.profileSections?.college_overview?.connect?.website ||
                "",
            },
          },
          course_info: {
            eligibilitySummary:
              profile.profileSections?.course_info?.eligibilitySummary || "",
          },
          placements: {
            placementReportUrl:
              profile.profileSections?.placements?.placementReportUrl || "",
            growthSummary:
              profile.profileSections?.placements?.growthSummary || "",
          },
          tuition_and_aid: {
            tuitionFeesSummary:
              profile.profileSections?.tuition_and_aid?.tuitionFeesSummary ||
              "",
            scholarshipCalculatorEnabled:
              !!profile.profileSections?.tuition_and_aid
                ?.scholarshipCalculatorEnabled,
          },
        },
      });

      // Load nested list state
      if (Array.isArray(profile.profileSections?.college_overview?.aminities)) {
        setAmenities(profile.profileSections.college_overview.aminities);
      }
      if (
        Array.isArray(
          profile.profileSections?.college_overview?.nearby_access?.transit,
        )
      ) {
        setTransitAccess(
          profile.profileSections.college_overview.nearby_access.transit,
        );
      }
      if (
        Array.isArray(
          profile.profileSections?.college_overview?.nearby_access?.essentials,
        )
      ) {
        setEssentialsAccess(
          profile.profileSections.college_overview.nearby_access.essentials,
        );
      }
      if (
        Array.isArray(profile.profileSections?.college_overview?.campus_reels)
      ) {
        setCampusReels(profile.profileSections.college_overview.campus_reels);
      }

      if (Array.isArray(profile.profileSections?.course_info?.seatMatrix)) {
        setSeatMatrix(profile.profileSections.course_info.seatMatrix);
      }
      if (
        Array.isArray(profile.profileSections?.course_info?.eligibilityCriteria)
      ) {
        setEligibilityCriteria(
          profile.profileSections.course_info.eligibilityCriteria,
        );
      }

      if (Array.isArray(profile.profileSections?.placements?.placementStats)) {
        setPlacementStats(profile.profileSections.placements.placementStats);
      }
      if (Array.isArray(profile.profileSections?.placements?.placementTrends)) {
        setPlacementTrends(profile.profileSections.placements.placementTrends);
      }
      if (Array.isArray(profile.profileSections?.placements?.notableOffers)) {
        setNotableOffers(profile.profileSections.placements.notableOffers);
      }

      if (
        Array.isArray(profile.profileSections?.tuition_and_aid?.additionalFees)
      ) {
        setAdditionalFees(
          profile.profileSections.tuition_and_aid.additionalFees,
        );
      }
      if (
        Array.isArray(profile.profileSections?.tuition_and_aid?.installments)
      ) {
        setInstallmentSchedule(
          profile.profileSections.tuition_and_aid.installments,
        );
      }
      if (
        Array.isArray(profile.profileSections?.tuition_and_aid?.scholarships)
      ) {
        setScholarshipsList(
          profile.profileSections.tuition_and_aid.scholarships,
        );
      }
    }
  }, [profile, reset]);

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity],
    );
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !amenities.includes(customAmenity.trim())) {
      setAmenities([...amenities, customAmenity.trim()]);
      setCustomAmenity("");
    }
  };

  const onSubmit = (data: ProfileFormData) => {
    // Construct final JSON payload cleanly preserving both standard and complex attributes
    const profileSectionsPayload = {
      ...data.profileSections,
      college_overview: {
        ...data.profileSections.college_overview,
        aminities: amenities,
        nearby_access: {
          transit: transitAccess,
          essentials: essentialsAccess,
        },
        campus_reels: campusReels,
      },
      course_info: {
        ...data.profileSections.course_info,
        seatMatrix: seatMatrix,
        eligibilityCriteria: eligibilityCriteria,
      },
      placements: {
        ...data.profileSections.placements,
        placementStats: placementStats,
        placementTrends: placementTrends,
        notableOffers: notableOffers,
      },
      tuition_and_aid: {
        ...data.profileSections.tuition_and_aid,
        additionalFees: additionalFees,
        installments: installmentSchedule,
        scholarships: scholarshipsList,
      },
    };

    updateProfile(
      {
        name: data.name,
        code: data.code,
        address: data.address,
        city: data.city,
        state: data.state,
        district: data.district,
        pinCode: data.pinCode,
        logoUrl: data.logoUrl ? data.logoUrl : null,
        coverImageUrl: data.coverImageUrl ? data.coverImageUrl : null,
        profileSections: profileSectionsPayload,
      },
      {
        onSuccess: () => {
          toast.success("Profile saved successfully");
          router.push(getPortalPath(collegeSlug, "/setup/campuses"));
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sleek Custom Tabs Switcher with glassmorphism accenting */}
      <div className="flex flex-wrap gap-2 border-b border-border/60 pb-3">
        {[
          { id: "basic", label: "Basic Info", icon: Building },
          { id: "overview", label: "Overview & Vibe", icon: Compass },
          { id: "admissions", label: "Admissions", icon: GraduationCap },
          { id: "placements", label: "Placements", icon: TrendingUp },
          { id: "fees", label: "Tuition & Aid", icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ==================== TAB 1: BASIC INFO ==================== */}
        {activeTab === "basic" && (
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Core identifiers and administrative contacts of your college.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">College Name</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">College Code</Label>
                  <Input
                    id="code"
                    placeholder="AMITY-N"
                    {...register("code")}
                  />
                  {errors.code && (
                    <p className="text-xs text-destructive">
                      {errors.code.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input id="address" {...register("address")} />
                  {errors.address && (
                    <p className="text-xs text-destructive">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register("city")} />
                  {errors.city && (
                    <p className="text-xs text-destructive">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input id="district" {...register("district")} />
                  {errors.district && (
                    <p className="text-xs text-destructive">
                      {errors.district.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" {...register("state")} />
                  {errors.state && (
                    <p className="text-xs text-destructive">
                      {errors.state.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pinCode">PIN Code</Label>
                  <Input id="pinCode" {...register("pinCode")} />
                  {errors.pinCode && (
                    <p className="text-xs text-destructive">
                      {errors.pinCode.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl">College Logo URL</Label>
                  <Input
                    id="logoUrl"
                    placeholder="https://example.com/logo.png"
                    {...register("logoUrl")}
                  />
                  {errors.logoUrl && (
                    <p className="text-xs text-destructive">
                      {errors.logoUrl.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverImageUrl">Cover Image URL</Label>
                  <Input
                    id="coverImageUrl"
                    placeholder="https://example.com/cover.jpg"
                    {...register("coverImageUrl")}
                  />
                  {errors.coverImageUrl && (
                    <p className="text-xs text-destructive">
                      {errors.coverImageUrl.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ==================== TAB 2: OVERVIEW & EXPERIENCE ==================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Dynamic statistics and Read-only metrics banner */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border border-border/50 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                <CardContent className="pt-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Courses
                  </p>
                  <p className="text-3xl font-extrabold mt-1 text-blue-500">
                    {profile?.totalCourses ?? 0}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Automatically computed from academic database
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border/50 bg-gradient-to-br from-green-500/5 to-teal-500/5">
                <CardContent className="pt-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Institution Type
                  </p>
                  <p className="text-lg font-bold mt-2 text-green-600 truncate">
                    {profile?.instituteType || "State University"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Fetched from linked University details
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border/50 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                <CardContent className="pt-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Linked Ambassadors
                  </p>
                  <p className="text-3xl font-extrabold mt-1 text-purple-500">
                    {profile?.campusAmbassadors?.length ?? 0}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Active student/teacher representatives
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle>College Experience & Vibes</CardTitle>
                <CardDescription>
                  Tell students about campus life, amenities, and location
                  guides.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="overview-desc">
                    Institutional Description
                  </Label>
                  <Textarea
                    id="overview-desc"
                    placeholder="Provide a compelling story about your university, history, and mission..."
                    className="min-h-[120px]"
                    {...register(
                      "profileSections.college_overview.description",
                    )}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2 border-t pt-6 border-border/40">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" /> Accreditation &
                      Affiliations
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="accred-img">Badge Image URL</Label>
                      <Input
                        id="accred-img"
                        placeholder="https://example.com/naac.png"
                        {...register(
                          "profileSections.college_overview.accreditation_and_affilation.img",
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accred-desc">Accreditation Summary</Label>
                      <Textarea
                        id="accred-desc"
                        placeholder="NAAC A++ Grade, AICTE Approved..."
                        {...register(
                          "profileSections.college_overview.accreditation_and_affilation.description",
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Compass className="h-4 w-4 text-primary" /> Inside Campus
                      Highlights
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="campus-img">Highlight Cover URL</Label>
                      <Input
                        id="campus-img"
                        placeholder="https://example.com/campus-life.jpg"
                        {...register(
                          "profileSections.college_overview.inside_campus.img",
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campus-desc">Inside Campus Vibe</Label>
                      <Textarea
                        id="campus-desc"
                        placeholder="Modern high-tech corridors, interactive smart boards, greenery..."
                        {...register(
                          "profileSections.college_overview.inside_campus.description",
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Institution parameters */}
                <div className="grid gap-6 md:grid-cols-3 border-t pt-6 border-border/40">
                  <div className="space-y-2">
                    <Label htmlFor="details-estd">Established Year</Label>
                    <Input
                      id="details-estd"
                      placeholder="2005"
                      {...register(
                        "profileSections.college_overview.instution_details.estd",
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="details-gender">Admission Target</Label>
                    <select
                      id="details-gender"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      {...register(
                        "profileSections.college_overview.instution_details.gender",
                      )}
                    >
                      <option value="Co-Ed">Co-Educational</option>
                      <option value="Girls">Girls Only</option>
                      <option value="Boys">Boys Only</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="details-avg-stud">
                      Average Yearly Intake
                    </Label>
                    <Input
                      id="details-avg-stud"
                      placeholder="1500+"
                      {...register(
                        "profileSections.college_overview.instution_details.average_student_count",
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="details-campus-size">
                      Campus Size (Acres)
                    </Label>
                    <Input
                      id="details-campus-size"
                      placeholder="120 Acres"
                      {...register(
                        "profileSections.college_overview.instution_details.campus_size",
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="details-outside">
                      % of Outside State Students
                    </Label>
                    <Input
                      id="details-outside"
                      placeholder="35%"
                      {...register(
                        "profileSections.college_overview.instution_details.Student_from_outside",
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="details-map">Google Maps Embed Link</Label>
                    <Input
                      id="details-map"
                      placeholder="https://google.com/maps/..."
                      {...register(
                        "profileSections.college_overview.location.map_link",
                      )}
                    />
                  </div>
                </div>

                {/* Predefined & Custom Amenities tags editor */}
                <div className="border-t pt-6 border-border/40 space-y-3">
                  <Label>Interactive Campus Amenities</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {PREDEFINED_AMENITIES.map((item) => {
                      const isSelected = amenities.includes(item);
                      return (
                        <Badge
                          key={item}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer px-3 py-1 text-xs select-none transition-all duration-200"
                          onClick={() => toggleAmenity(item)}
                        >
                          {isSelected ? "✓ " : "+ "} {item}
                        </Badge>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 max-w-sm">
                    <Input
                      placeholder="Add custom amenity..."
                      value={customAmenity}
                      onChange={(e) => setCustomAmenity(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addCustomAmenity}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {amenities
                      .filter((a) => !PREDEFINED_AMENITIES.includes(a))
                      .map((custom) => (
                        <Badge
                          key={custom}
                          variant="secondary"
                          className="pl-3 pr-2 py-1 text-xs flex items-center gap-1"
                        >
                          {custom}
                          <Trash2
                            className="h-3 w-3 text-destructive cursor-pointer hover:scale-110"
                            onClick={() => toggleAmenity(custom)}
                          />
                        </Badge>
                      ))}
                  </div>
                </div>

                {/* Transit & Essentials accessibility grids */}
                <div className="grid gap-6 md:grid-cols-2 border-t pt-6 border-border/40">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" /> Transit
                        Accessibility
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setTransitAccess([
                            ...transitAccess,
                            { type: "Metro", name: "", distance: "" },
                          ])
                        }
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Transit
                      </Button>
                    </div>
                    {transitAccess.map((row, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <select
                          className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                          value={row.type}
                          onChange={(e) => {
                            const updated = [...transitAccess];
                            updated[idx].type = e.target.value;
                            setTransitAccess(updated);
                          }}
                        >
                          <option value="Metro">Metro</option>
                          <option value="Bus Station">Bus</option>
                          <option value="Railway">Railway</option>
                          <option value="Airport">Airport</option>
                        </select>
                        <Input
                          placeholder="Station Name"
                          className="h-8 text-xs"
                          value={row.name}
                          onChange={(e) => {
                            const updated = [...transitAccess];
                            updated[idx].name = e.target.value;
                            setTransitAccess(updated);
                          }}
                        />
                        <Input
                          placeholder="Distance (e.g. 2.5 km)"
                          className="h-8 text-xs w-28"
                          value={row.distance}
                          onChange={(e) => {
                            const updated = [...transitAccess];
                            updated[idx].distance = e.target.value;
                            setTransitAccess(updated);
                          }}
                        />
                        <button
                          type="button"
                          className="text-destructive hover:scale-105"
                          onClick={() =>
                            setTransitAccess(
                              transitAccess.filter((_, i) => i !== idx),
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-500" /> Nearby
                        Essentials
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEssentialsAccess([
                            ...essentialsAccess,
                            { type: "Hospital", name: "", distance: "" },
                          ])
                        }
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Essential
                      </Button>
                    </div>
                    {essentialsAccess.map((row, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <select
                          className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                          value={row.type}
                          onChange={(e) => {
                            const updated = [...essentialsAccess];
                            updated[idx].type = e.target.value;
                            setEssentialsAccess(updated);
                          }}
                        >
                          <option value="Hospital">Hospital</option>
                          <option value="Pharmacy">Pharmacy</option>
                          <option value="Mall">Mall/Market</option>
                          <option value="ATM">ATM / Bank</option>
                        </select>
                        <Input
                          placeholder="Name"
                          className="h-8 text-xs"
                          value={row.name}
                          onChange={(e) => {
                            const updated = [...essentialsAccess];
                            updated[idx].name = e.target.value;
                            setEssentialsAccess(updated);
                          }}
                        />
                        <Input
                          placeholder="Distance (e.g. 1.2 km)"
                          className="h-8 text-xs w-28"
                          value={row.distance}
                          onChange={(e) => {
                            const updated = [...essentialsAccess];
                            updated[idx].distance = e.target.value;
                            setEssentialsAccess(updated);
                          }}
                        />
                        <button
                          type="button"
                          className="text-destructive hover:scale-105"
                          onClick={() =>
                            setEssentialsAccess(
                              essentialsAccess.filter((_, i) => i !== idx),
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Campus Ambassadors listing from database */}
                {profile?.campusAmbassadors &&
                  profile.campusAmbassadors.length > 0 && (
                    <div className="border-t pt-6 border-border/40 space-y-4">
                      <Label className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-500" /> Campus
                        Ambassadors (Active representatives from DB)
                      </Label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {profile.campusAmbassadors.map((amb: any) => (
                          <div
                            key={amb.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-muted/20"
                          >
                            <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center font-bold text-purple-600">
                              {amb.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">
                                {amb.fullName}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {amb.email}
                              </p>
                              {amb.phoneNumber && (
                                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                                  {amb.phoneNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Video reels */}
                <div className="border-t pt-6 border-border/40 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-red-500" /> Campus Short
                      Video Reels
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setCampusReels([
                          ...campusReels,
                          { title: "", link: "" },
                        ])
                      }
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Reel
                    </Button>
                  </div>
                  {campusReels.map((reel, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <Input
                        placeholder="Reel Title (e.g. Campus tour)"
                        className="h-9 text-xs"
                        value={reel.title}
                        onChange={(e) => {
                          const updated = [...campusReels];
                          updated[idx].title = e.target.value;
                          setCampusReels(updated);
                        }}
                      />
                      <Input
                        placeholder="Video Link (e.g. https://youtube.com/shorts/...)"
                        className="h-9 text-xs flex-1"
                        value={reel.link}
                        onChange={(e) => {
                          const updated = [...campusReels];
                          updated[idx].link = e.target.value;
                          setCampusReels(updated);
                        }}
                      />
                      <button
                        type="button"
                        className="text-destructive hover:scale-105"
                        onClick={() =>
                          setCampusReels(
                            campusReels.filter((_, i) => i !== idx),
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Social links */}
                <div className="grid gap-6 md:grid-cols-2 border-t pt-6 border-border/40">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin-url">LinkedIn Profile</Label>
                    <Input
                      id="linkedin-url"
                      placeholder="https://linkedin.com/school/..."
                      {...register(
                        "profileSections.college_overview.connect.linkedin",
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insta-url">Instagram Page</Label>
                    <Input
                      id="insta-url"
                      placeholder="https://instagram.com/..."
                      {...register(
                        "profileSections.college_overview.connect.instagram",
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter-url">Twitter / X Handle</Label>
                    <Input
                      id="twitter-url"
                      placeholder="https://twitter.com/..."
                      {...register(
                        "profileSections.college_overview.connect.twitter",
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website-url">Official Website</Label>
                    <Input
                      id="website-url"
                      placeholder="https://example.edu"
                      {...register(
                        "profileSections.college_overview.connect.website",
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ==================== TAB 3: ADMISSIONS ==================== */}
        {activeTab === "admissions" && (
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Admissions & Seat Quota Matrix</CardTitle>
              <CardDescription>
                Manage seats allocations, student quotas, and entrance
                requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quota Matrix */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" /> Quota Seat
                    Matrix
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSeatMatrix([
                        ...seatMatrix,
                        { quota: "General", total: "", open: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Quota
                  </Button>
                </div>
                {seatMatrix.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-4 gap-4 items-center"
                  >
                    <select
                      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                      value={row.quota}
                      onChange={(e) => {
                        const updated = [...seatMatrix];
                        updated[idx].quota = e.target.value;
                        setSeatMatrix(updated);
                      }}
                    >
                      <option value="General">General Quota</option>
                      <option value="Management">Management Quota</option>
                      <option value="NRI">NRI Quota</option>
                      <option value="State Domicile">State Domicile</option>
                      <option value="Sports/ECA">Sports/ECA Quota</option>
                    </select>
                    <Input
                      placeholder="Total Seats"
                      className="h-9"
                      value={row.total}
                      onChange={(e) => {
                        const updated = [...seatMatrix];
                        updated[idx].total = e.target.value;
                        setSeatMatrix(updated);
                      }}
                    />
                    <Input
                      placeholder="Open Seats"
                      className="h-9"
                      value={row.open}
                      onChange={(e) => {
                        const updated = [...seatMatrix];
                        updated[idx].open = e.target.value;
                        setSeatMatrix(updated);
                      }}
                    />
                    <button
                      type="button"
                      className="text-destructive hover:scale-105 justify-self-start"
                      onClick={() =>
                        setSeatMatrix(seatMatrix.filter((_, i) => i !== idx))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Eligibility checklist */}
              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-purple-500" />{" "}
                    Eligibility Checkpoints
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setEligibilityCriteria([
                        ...eligibilityCriteria,
                        { studentType: "Indian Local", criteria: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Eligibility
                  </Button>
                </div>
                {eligibilityCriteria.map((row, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <select
                      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm w-44"
                      value={row.studentType}
                      onChange={(e) => {
                        const updated = [...eligibilityCriteria];
                        updated[idx].studentType = e.target.value;
                        setEligibilityCriteria(updated);
                      }}
                    >
                      <option value="Indian Local">Indian (Local)</option>
                      <option value="State Resident">State Resident</option>
                      <option value="International">International</option>
                      <option value="Quota Specific">Quota Specific</option>
                    </select>
                    <Input
                      placeholder="Minimum 60% in 12th Board examinations..."
                      className="h-9 flex-1"
                      value={row.criteria}
                      onChange={(e) => {
                        const updated = [...eligibilityCriteria];
                        updated[idx].criteria = e.target.value;
                        setEligibilityCriteria(updated);
                      }}
                    />
                    <button
                      type="button"
                      className="text-destructive hover:scale-105"
                      onClick={() =>
                        setEligibilityCriteria(
                          eligibilityCriteria.filter((_, i) => i !== idx),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 border-border/40 space-y-2">
                <Label htmlFor="eligibility-sum">
                  Overview of Admissions Criteria
                </Label>
                <Textarea
                  id="eligibility-sum"
                  placeholder="Provide brief guidelines about entrance tests, interviews, and timeline..."
                  {...register(
                    "profileSections.course_info.eligibilitySummary",
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ==================== TAB 4: PLACEMENTS ==================== */}
        {activeTab === "placements" && (
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Placements & Recruiter Highlights</CardTitle>
              <CardDescription>
                Upload stats to show off average packages and notable corporate
                offers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="placement-rep">
                    Placement Report (PDF Link)
                  </Label>
                  <Input
                    id="placement-rep"
                    placeholder="https://example.com/placement-report.pdf"
                    {...register(
                      "profileSections.placements.placementReportUrl",
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placement-grow">
                    Placement Success/Growth Summary
                  </Label>
                  <Input
                    id="placement-grow"
                    placeholder="35% increase in placement offers over last academic cycle..."
                    {...register("profileSections.placements.growthSummary")}
                  />
                </div>
              </div>

              {/* Placement stats */}
              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" /> Placement
                    Quick Stats
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setPlacementStats([
                        ...placementStats,
                        { title: "", value: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Stat
                  </Button>
                </div>
                {placementStats.map((row, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <Input
                      placeholder="Title (e.g. Average Package)"
                      className="h-9"
                      value={row.title}
                      onChange={(e) => {
                        const updated = [...placementStats];
                        updated[idx].title = e.target.value;
                        setPlacementStats(updated);
                      }}
                    />
                    <Input
                      placeholder="Value (e.g. 8.5 LPA)"
                      className="h-9 w-44"
                      value={row.value}
                      onChange={(e) => {
                        const updated = [...placementStats];
                        updated[idx].value = e.target.value;
                        setPlacementStats(updated);
                      }}
                    />
                    <button
                      type="button"
                      className="text-destructive hover:scale-105"
                      onClick={() =>
                        setPlacementStats(
                          placementStats.filter((_, i) => i !== idx),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Trends chart */}
              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-500" /> Placement
                    Package Trends
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setPlacementTrends([
                        ...placementTrends,
                        { year: "", averagePackage: "", highestPackage: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Trend Year
                  </Button>
                </div>
                {placementTrends.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-4 gap-4 items-center"
                  >
                    <Input
                      placeholder="Year (e.g. 2024)"
                      className="h-9"
                      value={row.year}
                      onChange={(e) => {
                        const updated = [...placementTrends];
                        updated[idx].year = e.target.value;
                        setPlacementTrends(updated);
                      }}
                    />
                    <Input
                      placeholder="Average (LPA)"
                      className="h-9"
                      value={row.averagePackage}
                      onChange={(e) => {
                        const updated = [...placementTrends];
                        updated[idx].averagePackage = e.target.value;
                        setPlacementTrends(updated);
                      }}
                    />
                    <Input
                      placeholder="Highest (LPA)"
                      className="h-9"
                      value={row.highestPackage}
                      onChange={(e) => {
                        const updated = [...placementTrends];
                        updated[idx].highestPackage = e.target.value;
                        setPlacementTrends(updated);
                      }}
                    />
                    <button
                      type="button"
                      className="text-destructive hover:scale-105"
                      onClick={() =>
                        setPlacementTrends(
                          placementTrends.filter((_, i) => i !== idx),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Notable Offers */}
              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-500" /> Outstanding
                    Placement Offers
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setNotableOffers([
                        ...notableOffers,
                        { studentName: "", company: "", package: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Offer Record
                  </Button>
                </div>
                {notableOffers.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-4 gap-4 items-center"
                  >
                    <Input
                      placeholder="Student Name"
                      className="h-9"
                      value={row.studentName}
                      onChange={(e) => {
                        const updated = [...notableOffers];
                        updated[idx].studentName = e.target.value;
                        setNotableOffers(updated);
                      }}
                    />
                    <Input
                      placeholder="Company"
                      className="h-9"
                      value={row.company}
                      onChange={(e) => {
                        const updated = [...notableOffers];
                        updated[idx].company = e.target.value;
                        setNotableOffers(updated);
                      }}
                    />
                    <Input
                      placeholder="Package (LPA)"
                      className="h-9"
                      value={row.package}
                      onChange={(e) => {
                        const updated = [...notableOffers];
                        updated[idx].package = e.target.value;
                        setNotableOffers(updated);
                      }}
                    />
                    <button
                      type="button"
                      className="text-destructive hover:scale-105 justify-self-start"
                      onClick={() =>
                        setNotableOffers(
                          notableOffers.filter((_, i) => i !== idx),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ==================== TAB 5: TUITION & AID ==================== */}
        {activeTab === "fees" && (
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Tuition Fees, Deadlines & Scholarships</CardTitle>
              <CardDescription>
                Setup clear tuition structures, utility charges, deadlines, and
                aid calculator.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tuition-fees-sum">Tuition Fees Overview</Label>
                <Textarea
                  id="tuition-fees-sum"
                  placeholder="General structure of yearly tuition fees per program levels..."
                  {...register(
                    "profileSections.tuition_and_aid.tuitionFeesSummary",
                  )}
                />
              </div>

              {/* Additional Fees */}
              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-500" /> Utility /
                    Additional Charges
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setAdditionalFees([
                        ...additionalFees,
                        { name: "", amount: "", frequency: "One-Time" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Charge
                  </Button>
                </div>
                {additionalFees.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-4 gap-4 items-center"
                  >
                    <Input
                      placeholder="Charge Name (e.g. Admission Fee)"
                      className="h-9"
                      value={row.name}
                      onChange={(e) => {
                        const updated = [...additionalFees];
                        updated[idx].name = e.target.value;
                        setAdditionalFees(updated);
                      }}
                    />
                    <Input
                      placeholder="Amount"
                      className="h-9"
                      value={row.amount}
                      onChange={(e) => {
                        const updated = [...additionalFees];
                        updated[idx].amount = e.target.value;
                        setAdditionalFees(updated);
                      }}
                    />
                    <select
                      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                      value={row.frequency}
                      onChange={(e) => {
                        const updated = [...additionalFees];
                        updated[idx].frequency = e.target.value;
                        setAdditionalFees(updated);
                      }}
                    >
                      <option value="One-Time">One-Time</option>
                      <option value="Per Semester">Per Semester</option>
                      <option value="Annual">Annual</option>
                      <option value="Refundable">Refundable Deposit</option>
                    </select>
                    <button
                      type="button"
                      className="text-destructive hover:scale-105 justify-self-start"
                      onClick={() =>
                        setAdditionalFees(
                          additionalFees.filter((_, i) => i !== idx),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Installment Plan */}
              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />{" "}
                    Installments Schedule & Deadlines
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setInstallmentSchedule([
                        ...installmentSchedule,
                        { installmentNo: "", dueDate: "", percentage: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Installment
                  </Button>
                </div>
                {installmentSchedule.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-4 gap-4 items-center"
                  >
                    <Input
                      placeholder="No. (e.g. 1st Installment)"
                      className="h-9"
                      value={row.installmentNo}
                      onChange={(e) => {
                        const updated = [...installmentSchedule];
                        updated[idx].installmentNo = e.target.value;
                        setInstallmentSchedule(updated);
                      }}
                    />
                    <Input
                      placeholder="Due Date (e.g. July 31)"
                      className="h-9"
                      value={row.dueDate}
                      onChange={(e) => {
                        const updated = [...installmentSchedule];
                        updated[idx].dueDate = e.target.value;
                        setInstallmentSchedule(updated);
                      }}
                    />
                    <Input
                      placeholder="Percentage (e.g. 50%)"
                      className="h-9"
                      value={row.percentage}
                      onChange={(e) => {
                        const updated = [...installmentSchedule];
                        updated[idx].percentage = e.target.value;
                        setInstallmentSchedule(updated);
                      }}
                    />
                    <button
                      type="button"
                      className="text-destructive hover:scale-105 justify-self-start"
                      onClick={() =>
                        setInstallmentSchedule(
                          installmentSchedule.filter((_, i) => i !== idx),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Scholarships */}
              <div className="border-t pt-6 border-border/40 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4 text-purple-500" /> Scholarships &
                    Aids
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setScholarshipsList([
                        ...scholarshipsList,
                        { name: "", concession: "", criteria: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Scholarship
                  </Button>
                </div>
                {scholarshipsList.map((row, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <Input
                      placeholder="Scholarship Name"
                      className="h-9 w-44"
                      value={row.name}
                      onChange={(e) => {
                        const updated = [...scholarshipsList];
                        updated[idx].name = e.target.value;
                        setScholarshipsList(updated);
                      }}
                    />
                    <Input
                      placeholder="Concession (e.g. 50% waiver)"
                      className="h-9 w-44"
                      value={row.concession}
                      onChange={(e) => {
                        const updated = [...scholarshipsList];
                        updated[idx].concession = e.target.value;
                        setScholarshipsList(updated);
                      }}
                    />
                    <Input
                      placeholder="Criteria (e.g. >95% in 12th Board)"
                      className="h-9 flex-1"
                      value={row.criteria}
                      onChange={(e) => {
                        const updated = [...scholarshipsList];
                        updated[idx].criteria = e.target.value;
                        setScholarshipsList(updated);
                      }}
                    />
                    <button
                      type="button"
                      className="text-destructive hover:scale-105"
                      onClick={() =>
                        setScholarshipsList(
                          scholarshipsList.filter((_, i) => i !== idx),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Calculator toggle */}
              <div className="flex items-center gap-2 border-t pt-6 border-border/40">
                <input
                  type="checkbox"
                  id="calc-enabled"
                  className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register(
                    "profileSections.tuition_and_aid.scholarshipCalculatorEnabled",
                  )}
                />
                <Label htmlFor="calc-enabled">
                  Enable dynamic scholarship calculator on public portal
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Global Save & Continue trigger */}
        <div className="flex justify-end pt-4 border-t border-border/50">
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile & Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
