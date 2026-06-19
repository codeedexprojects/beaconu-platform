"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import {
  Loader2,
  ArrowRight,
  Building,
  Plus,
  Trash2,
  Globe,
  Play,
  Users,
  Compass,
  MapPin,
  FileText,
  Save,
  Check,
  ExternalLink,
  Sparkles,
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

import {
  useCollegeProfile,
  useUpdateCollegeProfile,
} from "@/hooks/use-colleges";
import {
  getDefaultCollegeOverviewAmenities,
  mergeCollegeOverviewAmenities,
  resolveCollegeAmenityIcon,
} from "@beaconu/utils";
import { uploadCollegeAdminFile } from "@/lib/services/colleges.service";
import { getCollegeSlugFromPath, getPortalPath } from "@/lib/portal-path";

// Tab metadata
const PROFILE_TABS = [
  {
    id: "basic",
    label: "Basic Info",
    icon: Building,
    desc: "Primary institutional parameters and contact details",
  },
  {
    id: "college_overview",
    label: "College Overview",
    icon: Compass,
    desc: "Campus scale, ratings, facilities, accolades, and media",
  },
  {
    id: "student_code_of_conduct",
    label: "Student Conduct",
    icon: FileText,
    desc: "Rules and discipline guidelines for students",
  },
  {
    id: "happenings",
    label: "Happenings",
    icon: Play,
    desc: "Important events, updates, and news highlights",
  },
  {
    id: "institutions_across_world",
    label: "Global Presence",
    icon: Globe,
    desc: "International partner colleges and exchange networks",
  },
  {
    id: "commute",
    label: "Commute & Access",
    icon: MapPin,
    desc: "Nearby transit hubs and regional accessibility mappings",
  },
] as const;

type ProfileTabId = (typeof PROFILE_TABS)[number]["id"];

const profileSchema = z.object({
  name: z.string().min(2, "College name must be at least 2 characters"),
  code: z.string().min(2, "College code must be at least 2 characters"),
  leadId: z.string().optional().nullable(),
  addressFromLead: z.boolean().default(false),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  pinCode: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  requestedGroupCode: z.string().optional().nullable(),
  profileSections: z.object({
    college_overview: z.any().optional(),
    student_code_of_conduct: z.any().optional(),
    happenings: z.any().optional(),
    institutions_across_world: z.any().optional(),
    commute: z.any().optional(),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function SetupProfilePage() {
  const router = useRouter();
  const collegeSlug =
    typeof window === "undefined"
      ? null
      : getCollegeSlugFromPath(window.location.pathname, window.location.host);

  const [activeTab, setActiveTab] = useState<ProfileTabId>("basic");
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const { data: profile, isLoading } = useCollegeProfile();
  const { mutate: updateProfile, isPending } = useUpdateCollegeProfile();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema as any),
    defaultValues: {
      addressFromLead: false,
      profileSections: {},
    },
  });

  useEffect(() => {
    if (profile) {
      const commuteSection = (profile.profileSections?.commute as any) || {};
      const existingOverview =
        (profile.profileSections?.college_overview as Record<string, any>) ||
        undefined;
      const mergedAmenities = mergeCollegeOverviewAmenities(
        existingOverview?.amenities,
      );
      const collegeOverviewSection = existingOverview
        ? { ...existingOverview, amenities: mergedAmenities }
        : {
            id: "college_overview",
            enabled: true,
            name: profile.name || "",
            alt_name: "",
            location_name: profile.city
              ? `${profile.city}, ${profile.state}`
              : "",
            type: "Public",
            established: 2000,
            navigation_tabs: ["Overview", "Governance"],
            about: "",
            accolades: [],
            university_details: [
              { label: "Established year", value: "2000" },
              { label: "Nature of University", value: "Public" },
              { label: "Type of University", value: "State University" },
              { label: "District", value: profile.district || "" },
              { label: "State", value: profile.state || "" },
              { label: "Pincode", value: profile.pinCode || "" },
              { label: "Total Courses", value: "" },
              { label: "Gender", value: "Co-Ed" },
              { label: "Campus Size", value: "" },
              { label: "Avg Student Count", value: "" },
              { label: "Students Outside State", value: "" },
            ],
            amenities: mergedAmenities,
            inside_campus_facilities: [],
            location: {
              address: profile.address || "",
              latitude: null,
              longitude: null,
              map_link: "",
            },
            nearby_access: [],
            campus_ambassadors: [],
            social: [],
            campus_reels: [],
          };

      reset({
        name: profile.name || "",
        code: profile.code || "",
        leadId:
          (profile.settings?.registrationMeta as any)?.leadId ||
          profile.leadId ||
          "",
        addressFromLead:
          (profile.settings?.registrationMeta as any)?.addressFromLead ??
          profile.addressFromLead ??
          false,
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        district: profile.district || "",
        pinCode: profile.pinCode || "",
        logoUrl: profile.logoUrl || "",
        coverImageUrl: profile.coverImageUrl || "",
        requestedGroupCode: profile.requestedGroupCode || "",
        profileSections: {
          student_code_of_conduct: profile.profileSections
            ?.student_code_of_conduct || {
            id: "student_code_of_conduct",
            enabled: true,
            tab: "student_code_of_conduct",
            section_title: "General Rules of Discipline",
            rules: [],
          },
          happenings: profile.profileSections?.happenings || {
            id: "happenings",
            enabled: true,
            title: "Happenings",
            filters: { categories: ["Certification"] },
            happenings: [],
          },
          institutions_across_world: profile.profileSections
            ?.institutions_across_world || {
            id: "institutions_across_world",
            enabled: true,
            title: "Institution Across the World",
            institutions: [],
          },
          commute: {
            id: "commute",
            enabled: true,
            tab: "commute",
            title: commuteSection.title || "Commute",
            pickup_points: Array.isArray(commuteSection.pickup_points)
              ? commuteSection.pickup_points
              : [],
            selected_pickup_point: commuteSection.selected_pickup_point || "",
            routes: Array.isArray(commuteSection.routes)
              ? commuteSection.routes
              : [],
            rules_and_code_of_conduct: {
              title:
                commuteSection.rules_and_code_of_conduct?.title ||
                "Rules & Code of Conduct",
              subtitle:
                commuteSection.rules_and_code_of_conduct?.subtitle ||
                "Detailed guidelines for student commuters",
              intro:
                commuteSection.rules_and_code_of_conduct?.intro ||
                "To ensure a safe and punctual commute for everyone, all students utilizing the transport facility must strictly adhere to the following code of conduct.",
              rules: Array.isArray(
                commuteSection.rules_and_code_of_conduct?.rules,
              )
                ? commuteSection.rules_and_code_of_conduct.rules
                : [],
            },
          },
          college_overview: collegeOverviewSection,
        },
      });
    }
  }, [profile, reset]);

  // Form watch variables for nested arrays/objects
  const rules = watch("profileSections.student_code_of_conduct.rules") || [];
  const happeningsList = watch("profileSections.happenings.happenings") || [];
  const globalInstitutions =
    watch("profileSections.institutions_across_world.institutions") || [];

  // Overview arrays
  const overviewAccolades =
    watch("profileSections.college_overview.accolades") || [];
  const overviewUnivDetails =
    watch("profileSections.college_overview.university_details") || [];
  const overviewAmenities =
    watch("profileSections.college_overview.amenities") || [];
  const overviewFacilities =
    watch("profileSections.college_overview.inside_campus_facilities") || [];
  const overviewSocialLinks =
    watch("profileSections.college_overview.social") || [];
  const overviewReels =
    watch("profileSections.college_overview.campus_reels") || [];
  const overviewAmbassadors =
    watch("profileSections.college_overview.campus_ambassadors") || [];
  const overviewNearbyAccess =
    watch("profileSections.college_overview.nearby_access") || [];

  // Commute arrays
  const commutePickupPoints =
    watch("profileSections.commute.pickup_points") || [];
  const commuteRoutes = watch("profileSections.commute.routes") || [];
  const commuteRules =
    watch("profileSections.commute.rules_and_code_of_conduct.rules") || [];

  const createEmptyCommuteStop = () => ({
    point: "",
    landmark: "",
    time: "",
  });

  const createEmptyCommuteRoute = () => ({
    pickup_point: "",
    route_name: "",
    via: "",
    status: "UNVERIFIED",
    timings: [
      { label: "Morning", time: "" },
      { label: "Evening", time: "" },
    ],
    transport_fee: {
      amount: "",
      payment_structure: "",
    },
    bus_information: {
      registration_number: "",
      seats: null,
      model: "",
    },
    morning_pickup_points: [],
    evening_dropoff_points: [],
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfile(
      {
        name: data.name,
        code: data.code,
        leadId: data.leadId || null,
        addressFromLead: data.addressFromLead,
        address: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        district: data.district || undefined,
        pinCode: data.pinCode || undefined,
        logoUrl: data.logoUrl || null,
        coverImageUrl: data.coverImageUrl || null,
        requestedGroupCode: data.requestedGroupCode || null,
        profileSections: data.profileSections,
        registrationTabs: [
          "student_code_of_conduct",
          "happenings",
          "institutions_across_world",
          "commute",
          "college_overview",
        ],
      },
      {
        onSuccess: () => {
          toast.success("College Profile configured successfully!");
        },
      },
    );
  };

  const handleImageUpload = async (
    file: File | null,
    fieldPath: string,
    context: string,
  ) => {
    if (!file) return;

    try {
      setUploadingField(fieldPath);
      const permanentUrl = await uploadCollegeAdminFile(file, context);
      setValue(fieldPath as any, permanentUrl, {
        shouldDirty: true,
      });
      toast.success("File uploaded to S3");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploadingField(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/60">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            College Profile Configuration
          </h2>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Set up details, discipline rules, commuting info, and global ties.
          </p>
        </div>

        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          size="lg"
          className="shadow-md bg-indigo-600 hover:bg-indigo-700 text-white transition-all font-semibold"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Save className="mr-2 h-5 w-5" />
          )}
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT NAVIGATION MENU */}
        <aside className="lg:col-span-3 space-y-2">
          {PROFILE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex flex-col items-start gap-1 p-4 rounded-xl text-left transition-all border ${
                  isActive
                    ? "bg-indigo-600/5 border-indigo-600/30 text-indigo-900 shadow-sm font-semibold ring-1 ring-indigo-500/20"
                    : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-5 w-5 ${isActive ? "text-indigo-600" : "text-muted-foreground"}`}
                  />
                  <span className="text-sm font-bold">{tab.label}</span>
                </div>
                <span className="text-xs text-muted-foreground/85 line-clamp-1 pl-8">
                  {tab.desc}
                </span>
              </button>
            );
          })}
        </aside>

        {/* RIGHT CONTENT PANEL */}
        <main className="lg:col-span-9">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* 1. BASIC INFO TAB */}
            {activeTab === "basic" && (
              <Card className="border border-border/80 shadow-md bg-card/60 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Building className="h-5 w-5 text-indigo-500" /> Basic
                    Details
                  </CardTitle>
                  <CardDescription>
                    Primary administrative metadata of your educational
                    institution.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="font-semibold text-foreground"
                      >
                        College Name *
                      </Label>
                      <Input
                        id="name"
                        placeholder="Beacon Institute of Technology"
                        {...register("name")}
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="code"
                        className="font-semibold text-foreground"
                      >
                        College Code *
                      </Label>
                      <Input
                        id="code"
                        placeholder="BIT-101"
                        className="uppercase"
                        {...register("code")}
                      />
                      {errors.code && (
                        <p className="text-xs text-destructive">
                          {errors.code.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="leadId"
                        className="font-semibold text-foreground"
                      >
                        Lead ID
                      </Label>
                      <Input
                        id="leadId"
                        placeholder="LEAD-2026-001"
                        {...register("leadId")}
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-8">
                      <Controller
                        name="addressFromLead"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="checkbox"
                            id="addressFromLead"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        )}
                      />
                      <Label
                        htmlFor="addressFromLead"
                        className="font-semibold text-sm cursor-pointer select-none"
                      >
                        Address source from Lead metadata
                      </Label>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label
                        htmlFor="address"
                        className="font-semibold text-foreground"
                      >
                        Full Address
                      </Label>
                      <Textarea
                        id="address"
                        placeholder="123 Tech Campus Road"
                        rows={2}
                        {...register("address")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="city"
                        className="font-semibold text-foreground"
                      >
                        City
                      </Label>
                      <Input
                        id="city"
                        placeholder="Bangalore"
                        {...register("city")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="state"
                        className="font-semibold text-foreground"
                      >
                        State
                      </Label>
                      <Input
                        id="state"
                        placeholder="Karnataka"
                        {...register("state")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="district"
                        className="font-semibold text-foreground"
                      >
                        District
                      </Label>
                      <Input
                        id="district"
                        placeholder="Bangalore Urban"
                        {...register("district")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="pinCode"
                        className="font-semibold text-foreground"
                      >
                        Pin Code
                      </Label>
                      <Input
                        id="pinCode"
                        placeholder="560001"
                        {...register("pinCode")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="logoUrl"
                        className="font-semibold text-foreground"
                      >
                        Logo Image URL
                      </Label>
                      <Input
                        id="logoUrl"
                        placeholder="https://example.com/logo.png"
                        {...register("logoUrl")}
                      />
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={uploadingField === "logoUrl"}
                        onChange={(e) =>
                          handleImageUpload(
                            e.target.files?.[0] ?? null,
                            "logoUrl",
                            "registration/logo",
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="coverImageUrl"
                        className="font-semibold text-foreground"
                      >
                        Cover Image URL
                      </Label>
                      <Input
                        id="coverImageUrl"
                        placeholder="https://example.com/cover.png"
                        {...register("coverImageUrl")}
                      />
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={uploadingField === "coverImageUrl"}
                        onChange={(e) =>
                          handleImageUpload(
                            e.target.files?.[0] ?? null,
                            "coverImageUrl",
                            "registration/cover",
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label
                        htmlFor="requestedGroupCode"
                        className="font-semibold text-foreground"
                      >
                        Requested Group Code
                      </Label>
                      <Input
                        id="requestedGroupCode"
                        placeholder="e.g. GROUP-ABC"
                        {...register("requestedGroupCode")}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 2. COLLEGE OVERVIEW TAB */}
            {activeTab === "college_overview" && (
              <Card className="border border-border/80 shadow-md bg-card/60 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Compass className="h-5 w-5 text-indigo-500" /> College
                    Overview
                  </CardTitle>
                  <CardDescription>
                    Configure the public overview details displayed on the
                    campus landing profile.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="font-semibold">
                        Alternative College Name
                      </Label>
                      <Input
                        placeholder="Alt Name"
                        {...register(
                          "profileSections.college_overview.alt_name",
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">
                        Display Location Name
                      </Label>
                      <Input
                        placeholder="Gachibowli, Hyderabad"
                        {...register(
                          "profileSections.college_overview.location_name",
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">College Type</Label>
                      <Input
                        placeholder="Public / Private"
                        {...register("profileSections.college_overview.type")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Established Year</Label>
                      <Input
                        type="number"
                        placeholder="2000"
                        {...register(
                          "profileSections.college_overview.established",
                          { valueAsNumber: true },
                        )}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="font-semibold">
                        About / Description
                      </Label>
                      <Textarea
                        placeholder="Describe the institution..."
                        rows={4}
                        {...register("profileSections.college_overview.about")}
                      />
                    </div>
                  </div>

                  {/* Accolades Section */}
                  <div className="space-y-4 pt-4 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
                        Accolades & Ratings
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue(
                            "profileSections.college_overview.accolades",
                            [
                              ...overviewAccolades,
                              { tag: "", title: "", image: "" },
                            ],
                          );
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Accolade
                      </Button>
                    </div>
                    {overviewAccolades.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No accolades configured yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {overviewAccolades.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex gap-3 items-center border p-3 rounded-lg bg-muted/20"
                          >
                            <Input
                              placeholder="Tag (e.g. Rank)"
                              className="max-w-[150px]"
                              {...register(
                                `profileSections.college_overview.accolades.${idx}.tag`,
                              )}
                            />
                            <Input
                              placeholder="Title (e.g. MAHE Rank 3)"
                              className="flex-1"
                              {...register(
                                `profileSections.college_overview.accolades.${idx}.title`,
                              )}
                            />
                            <Input
                              placeholder="Image Url"
                              className="flex-1"
                              {...register(
                                `profileSections.college_overview.accolades.${idx}.image`,
                              )}
                            />
                            <Input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="max-w-[220px]"
                              disabled={
                                uploadingField ===
                                `profileSections.college_overview.accolades.${idx}.image`
                              }
                              onChange={(e) =>
                                handleImageUpload(
                                  e.target.files?.[0] ?? null,
                                  `profileSections.college_overview.accolades.${idx}.image`,
                                  `college-overview/accolades-${idx}`,
                                )
                              }
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setValue(
                                  "profileSections.college_overview.accolades",
                                  overviewAccolades.filter(
                                    (_: any, i: number) => i !== idx,
                                  ),
                                );
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* University Details Section */}
                  <div className="space-y-4 pt-4 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
                        University Fact Sheet
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue(
                            "profileSections.college_overview.university_details",
                            [...overviewUnivDetails, { label: "", value: "" }],
                          );
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Stat
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {overviewUnivDetails.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex gap-2 items-center border p-2 rounded-lg bg-muted/10"
                        >
                          <Input
                            placeholder="Label"
                            className="h-9"
                            {...register(
                              `profileSections.college_overview.university_details.${idx}.label`,
                            )}
                          />
                          <Input
                            placeholder="Value"
                            className="h-9"
                            {...register(
                              `profileSections.college_overview.university_details.${idx}.value`,
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setValue(
                                "profileSections.college_overview.university_details",
                                overviewUnivDetails.filter(
                                  (_: any, i: number) => i !== idx,
                                ),
                              );
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amenities Section */}
                  <div className="space-y-4 pt-4 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
                        Campus Amenities
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue(
                            "profileSections.college_overview.amenities",
                            [...overviewAmenities, { label: "", icon: "" }],
                          );
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Amenity
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Global amenities are prefilled for every college. Add new
                      amenities below and upload custom icons for extra rows
                      when needed.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {overviewAmenities.map((item: any, idx: number) => {
                        const amenityLabel = item?.label || "Amenity";
                        const amenityIcon = resolveCollegeAmenityIcon(
                          item?.icon,
                          amenityLabel,
                        );

                        return (
                          <div
                            key={idx}
                            className="space-y-2 border p-3 rounded-lg bg-muted/10"
                          >
                            <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
                              {amenityIcon ? (
                                <img
                                  src={amenityIcon}
                                  alt={amenityLabel}
                                  className="h-9 w-9 rounded-md object-contain"
                                />
                              ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                                  Logo
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">
                                  {amenityLabel}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {item?.icon ||
                                    "Upload a custom icon or use the default global logo"}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <Input
                                placeholder="Amenity Label"
                                className="h-9"
                                {...register(
                                  `profileSections.college_overview.amenities.${idx}.label`,
                                )}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setValue(
                                    "profileSections.college_overview.amenities",
                                    overviewAmenities.filter(
                                      (_: any, i: number) => i !== idx,
                                    ),
                                  );
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Custom image URL or keep the global logo"
                              className="h-9"
                              {...register(
                                `profileSections.college_overview.amenities.${idx}.icon`,
                              )}
                            />
                            <Input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/svg+xml"
                              disabled={
                                uploadingField ===
                                `profileSections.college_overview.amenities.${idx}.icon`
                              }
                              onChange={(e) =>
                                handleImageUpload(
                                  e.target.files?.[0] ?? null,
                                  `profileSections.college_overview.amenities.${idx}.icon`,
                                  `college-overview/amenities-${idx}`,
                                )
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Inside Campus Facilities */}
                  <div className="space-y-4 pt-4 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
                        Campus Facilities & Outlets
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue(
                            "profileSections.college_overview.inside_campus_facilities",
                            [
                              ...overviewFacilities,
                              { label: "", subtitle: "", icon: "" },
                            ],
                          );
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Facility
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {overviewFacilities.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex gap-2 items-center border p-2 rounded-lg bg-muted/10"
                        >
                          <Input
                            placeholder="Facility Name"
                            className="h-9"
                            {...register(
                              `profileSections.college_overview.inside_campus_facilities.${idx}.label`,
                            )}
                          />
                          <Input
                            placeholder="Subtitle"
                            className="h-9"
                            {...register(
                              `profileSections.college_overview.inside_campus_facilities.${idx}.subtitle`,
                            )}
                          />
                          <Input
                            placeholder="Icon Url / Key"
                            className="h-9"
                            {...register(
                              `profileSections.college_overview.inside_campus_facilities.${idx}.icon`,
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setValue(
                                "profileSections.college_overview.inside_campus_facilities",
                                overviewFacilities.filter(
                                  (_: any, i: number) => i !== idx,
                                ),
                              );
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="space-y-4 pt-4 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
                        Social Links
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue("profileSections.college_overview.social", [
                            ...overviewSocialLinks,
                            { platform: "", icon: "", url: "" },
                          ]);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Social Link
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {overviewSocialLinks.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="grid gap-2 rounded-lg border bg-muted/10 p-3 md:grid-cols-[1fr_1fr_2fr_auto]"
                        >
                          <Input
                            placeholder="Platform"
                            className="h-9"
                            {...register(
                              `profileSections.college_overview.social.${idx}.platform`,
                            )}
                          />
                          <Input
                            placeholder="Icon"
                            className="h-9"
                            {...register(
                              `profileSections.college_overview.social.${idx}.icon`,
                            )}
                          />
                          <Input
                            placeholder="https://example.com/profile"
                            className="h-9"
                            {...register(
                              `profileSections.college_overview.social.${idx}.url`,
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setValue(
                                "profileSections.college_overview.social",
                                overviewSocialLinks.filter(
                                  (_: any, i: number) => i !== idx,
                                ),
                              );
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Location Settings */}
                  <div className="space-y-4 pt-4 border-t border-border/60">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
                      Geographic & Map Coordinates
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Google Maps Embed or Link</Label>
                        <Input
                          placeholder="Google Maps link"
                          {...register(
                            "profileSections.college_overview.location.map_link",
                          )}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Address String</Label>
                        <Input
                          placeholder="Map Address"
                          {...register(
                            "profileSections.college_overview.location.address",
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nearby Access Section */}
                  <div className="space-y-4 pt-4 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
                        Nearby Establishments
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue(
                            "profileSections.college_overview.nearby_access",
                            [
                              ...overviewNearbyAccess,
                              { category: "Transit", items: [] },
                            ],
                          );
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Category Group
                      </Button>
                    </div>
                    {overviewNearbyAccess.map(
                      (catGroup: any, catIdx: number) => (
                        <div
                          key={catIdx}
                          className="border p-4 rounded-lg bg-muted/10 space-y-3"
                        >
                          <div className="flex justify-between items-center gap-3">
                            <Input
                              placeholder="Category Name (e.g. Hospital)"
                              className="h-9 font-bold max-w-[200px]"
                              {...register(
                                `profileSections.college_overview.nearby_access.${catIdx}.category`,
                              )}
                            />
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const currentItems = catGroup.items || [];
                                  setValue(
                                    `profileSections.college_overview.nearby_access.${catIdx}.items`,
                                    [
                                      ...currentItems,
                                      { name: "", distance: "" },
                                    ],
                                  );
                                }}
                              >
                                Add Item
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setValue(
                                    "profileSections.college_overview.nearby_access",
                                    overviewNearbyAccess.filter(
                                      (_: any, i: number) => i !== catIdx,
                                    ),
                                  );
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {(catGroup.items || []).map(
                              (item: any, itemIdx: number) => (
                                <div
                                  key={itemIdx}
                                  className="flex gap-2 items-center pl-4"
                                >
                                  <Input
                                    placeholder="Name (e.g. Fortis Hospital)"
                                    className="h-8 text-sm flex-1"
                                    {...register(
                                      `profileSections.college_overview.nearby_access.${catIdx}.items.${itemIdx}.name`,
                                    )}
                                  />
                                  <Input
                                    placeholder="Distance (e.g. 2.4 km)"
                                    className="h-8 text-sm max-w-[120px]"
                                    {...register(
                                      `profileSections.college_overview.nearby_access.${catIdx}.items.${itemIdx}.distance`,
                                    )}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setValue(
                                        `profileSections.college_overview.nearby_access.${catIdx}.items`,
                                        catGroup.items.filter(
                                          (_: any, i: number) => i !== itemIdx,
                                        ),
                                      );
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                  </Button>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  {/* Campus Ambassadors */}
                  <div className="space-y-4 pt-4 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
                        Campus Ambassadors
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue(
                            "profileSections.college_overview.campus_ambassadors",
                            [
                              ...overviewAmbassadors,
                              {
                                name: "",
                                course: "",
                                district: "",
                                state: "",
                                image: "",
                                message_link: "",
                              },
                            ],
                          );
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Ambassador
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {overviewAmbassadors.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="border p-4 rounded-xl bg-muted/20 grid gap-3 md:grid-cols-2"
                        >
                          <div className="space-y-1">
                            <Label className="text-xs">Full Name</Label>
                            <Input
                              placeholder="Arshal Mathew"
                              className="h-9"
                              {...register(
                                `profileSections.college_overview.campus_ambassadors.${idx}.name`,
                              )}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Course Name</Label>
                            <Input
                              placeholder="B.Sc Nursing"
                              className="h-9"
                              {...register(
                                `profileSections.college_overview.campus_ambassadors.${idx}.course`,
                              )}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">District</Label>
                            <Input
                              placeholder="Palakkad"
                              className="h-9"
                              {...register(
                                `profileSections.college_overview.campus_ambassadors.${idx}.district`,
                              )}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">State</Label>
                            <Input
                              placeholder="Kerala"
                              className="h-9"
                              {...register(
                                `profileSections.college_overview.campus_ambassadors.${idx}.state`,
                              )}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Image Link</Label>
                            <Input
                              placeholder="https://example.com/ambassador.jpg"
                              className="h-9"
                              {...register(
                                `profileSections.college_overview.campus_ambassadors.${idx}.image`,
                              )}
                            />
                            <Input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              disabled={
                                uploadingField ===
                                `profileSections.college_overview.campus_ambassadors.${idx}.image`
                              }
                              onChange={(e) =>
                                handleImageUpload(
                                  e.target.files?.[0] ?? null,
                                  `profileSections.college_overview.campus_ambassadors.${idx}.image`,
                                  `college-overview/ambassadors-${idx}`,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">
                              Message/Chat CTA link
                            </Label>
                            <Input
                              placeholder="https://wa.me/..."
                              className="h-9"
                              {...register(
                                `profileSections.college_overview.campus_ambassadors.${idx}.message_link`,
                              )}
                            />
                          </div>
                          <div className="md:col-span-2 flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              className="text-destructive h-9"
                              onClick={() => {
                                setValue(
                                  "profileSections.college_overview.campus_ambassadors",
                                  overviewAmbassadors.filter(
                                    (_: any, i: number) => i !== idx,
                                  ),
                                );
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Remove
                              Ambassador
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Campus Reels Section */}
                  <div className="space-y-4 pt-4 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
                        Campus Reels & Videos
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue(
                            "profileSections.college_overview.campus_reels",
                            [
                              ...overviewReels,
                              {
                                title: "",
                                duration: "",
                                date: "",
                                video: "",
                                thumbnail: "",
                                type: "youtube",
                              },
                            ],
                          );
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Reel
                      </Button>
                    </div>
                    {overviewReels.map((reel: any, idx: number) => (
                      <div
                        key={idx}
                        className="border p-4 rounded-lg bg-muted/10 grid gap-3 md:grid-cols-2"
                      >
                        <div className="space-y-1">
                          <Label className="text-xs">Title</Label>
                          <Input
                            placeholder="Vydehi Institute Welcome"
                            className="h-9"
                            {...register(
                              `profileSections.college_overview.campus_reels.${idx}.title`,
                            )}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Video Source Link</Label>
                          <Input
                            placeholder="YouTube or Mp4 link"
                            className="h-9"
                            {...register(
                              `profileSections.college_overview.campus_reels.${idx}.video`,
                            )}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Duration text</Label>
                          <Input
                            placeholder="1 min 12 secs"
                            className="h-9"
                            {...register(
                              `profileSections.college_overview.campus_reels.${idx}.duration`,
                            )}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Date</Label>
                          <Input
                            placeholder="29th March"
                            className="h-9"
                            {...register(
                              `profileSections.college_overview.campus_reels.${idx}.date`,
                            )}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Thumbnail</Label>
                          <Input
                            placeholder="Thumbnail image URL"
                            className="h-9"
                            {...register(
                              `profileSections.college_overview.campus_reels.${idx}.thumbnail`,
                            )}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Video Type</Label>
                          <select
                            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            {...register(
                              `profileSections.college_overview.campus_reels.${idx}.type`,
                            )}
                          >
                            <option value="youtube">YouTube</option>
                            <option value="mp4">MP4 Video</option>
                          </select>
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-destructive h-9"
                            onClick={() => {
                              setValue(
                                "profileSections.college_overview.campus_reels",
                                overviewReels.filter(
                                  (_: any, i: number) => i !== idx,
                                ),
                              );
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Remove Reel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 3. STUDENT CONDUCT TAB */}
            {activeTab === "student_code_of_conduct" && (
              <Card className="border border-border/80 shadow-md bg-card/60 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-500" /> Student
                    Code of Conduct
                  </CardTitle>
                  <CardDescription>
                    Specify the code of discipline rules, instructions, and
                    standard regulations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="section_title" className="font-semibold">
                        Conduct Title
                      </Label>
                      <Input
                        id="section_title"
                        placeholder="General Rules of Discipline"
                        {...register(
                          "profileSections.student_code_of_conduct.section_title",
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                      <Label className="font-bold">Rules List</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue(
                            "profileSections.student_code_of_conduct.rules",
                            [...rules, { number: rules.length + 1, rule: "" }],
                          );
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Rule
                      </Button>
                    </div>

                    {rules.length === 0 ? (
                      <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground bg-muted/5">
                        No rules added yet. Click &apos;Add Rule&apos; to create
                        code of conduct rules.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {rules.map((ruleItem: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex gap-3 items-start border p-3 rounded-lg bg-muted/10"
                          >
                            <div className="font-bold text-sm text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-md mt-1">
                              #{idx + 1}
                            </div>
                            <Textarea
                              placeholder="Describe this rule details..."
                              className="flex-1 min-h-[60px]"
                              {...register(
                                `profileSections.student_code_of_conduct.rules.${idx}.rule`,
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-1"
                              onClick={() => {
                                const newRules = rules
                                  .filter((_: any, i: number) => i !== idx)
                                  .map((r: any, idxPos: number) => ({
                                    ...r,
                                    number: idxPos + 1,
                                  }));
                                setValue(
                                  "profileSections.student_code_of_conduct.rules",
                                  newRules,
                                );
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 4. HAPPENINGS TAB */}
            {activeTab === "happenings" && (
              <Card className="border border-border/80 shadow-md bg-card/60 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Play className="h-5 w-5 text-indigo-500" /> Happenings &
                    News
                  </CardTitle>
                  <CardDescription>
                    Publish events, certifications, achievements, and
                    notifications for prospects.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="happeningsTitle" className="font-semibold">
                      Section Heading Title
                    </Label>
                    <Input
                      id="happeningsTitle"
                      placeholder="Happenings"
                      {...register("profileSections.happenings.title")}
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/40">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold">Happenings Cards</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue("profileSections.happenings.happenings", [
                            ...happeningsList,
                            {
                              category: "Certification",
                              date: "",
                              title: "",
                              description: "",
                              image: "",
                              link: "",
                            },
                          ]);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Happening
                      </Button>
                    </div>

                    {happeningsList.length === 0 ? (
                      <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground bg-muted/5">
                        No events configured. Add first happening to highlight
                        campus news.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {happeningsList.map((happening: any, idx: number) => (
                          <div
                            key={idx}
                            className="border p-4 rounded-xl bg-muted/20 space-y-3"
                          >
                            <div className="flex justify-between items-center">
                              <h5 className="font-bold text-sm text-indigo-800">
                                Happening #{idx + 1}
                              </h5>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive h-8"
                                onClick={() => {
                                  setValue(
                                    "profileSections.happenings.happenings",
                                    happeningsList.filter(
                                      (_: any, i: number) => i !== idx,
                                    ),
                                  );
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-1">
                                <Label className="text-xs">Category</Label>
                                <Input
                                  placeholder="e.g. Certification / Event"
                                  {...register(
                                    `profileSections.happenings.happenings.${idx}.category`,
                                  )}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Date Label</Label>
                                <Input
                                  placeholder="Oct 12, 2023"
                                  {...register(
                                    `profileSections.happenings.happenings.${idx}.date`,
                                  )}
                                />
                              </div>
                              <div className="md:col-span-2 space-y-1">
                                <Label className="text-xs">Title</Label>
                                <Input
                                  placeholder="Professor Ratna awarded international certification"
                                  {...register(
                                    `profileSections.happenings.happenings.${idx}.title`,
                                  )}
                                />
                              </div>
                              <div className="md:col-span-2 space-y-1">
                                <Label className="text-xs">Description</Label>
                                <Textarea
                                  placeholder="Details about this achievement..."
                                  rows={2}
                                  {...register(
                                    `profileSections.happenings.happenings.${idx}.description`,
                                  )}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">
                                  Image Link URL
                                </Label>
                                <Input
                                  placeholder="https://example.com/image.jpg"
                                  {...register(
                                    `profileSections.happenings.happenings.${idx}.image`,
                                  )}
                                />
                                <Input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  disabled={
                                    uploadingField ===
                                    `profileSections.happenings.happenings.${idx}.image`
                                  }
                                  onChange={(e) =>
                                    handleImageUpload(
                                      e.target.files?.[0] ?? null,
                                      `profileSections.happenings.happenings.${idx}.image`,
                                      `happenings/items-${idx}`,
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">
                                  Read More Link (Link)
                                </Label>
                                <Input
                                  placeholder="https://example.com/details"
                                  {...register(
                                    `profileSections.happenings.happenings.${idx}.link`,
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 5. GLOBAL PRESENCE TAB */}
            {activeTab === "institutions_across_world" && (
              <Card className="border border-border/80 shadow-md bg-card/60 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Globe className="h-5 w-5 text-indigo-500" /> Institutions
                    Across the World
                  </CardTitle>
                  <CardDescription>
                    Configure global collaborations, student exchange programs,
                    or dual degree colleges.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="globalTitle" className="font-semibold">
                      Section Title
                    </Label>
                    <Input
                      id="globalTitle"
                      placeholder="Institution Across the World"
                      {...register(
                        "profileSections.institutions_across_world.title",
                      )}
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/40">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold">
                        Affiliated Institutions
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue(
                            "profileSections.institutions_across_world.institutions",
                            [
                              ...globalInstitutions,
                              { name: "", country: "", logo: "" },
                            ],
                          );
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Partner
                      </Button>
                    </div>

                    {globalInstitutions.length === 0 ? (
                      <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground bg-muted/5">
                        No global institutions configured. Add a partner to
                        highlight international footprint.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {globalInstitutions.map((inst: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex gap-3 items-center border p-3 rounded-lg bg-muted/10"
                          >
                            <Input
                              placeholder="Institution Name"
                              className="flex-1"
                              {...register(
                                `profileSections.institutions_across_world.institutions.${idx}.name`,
                              )}
                            />
                            <Input
                              placeholder="Country / Region"
                              className="flex-1"
                              {...register(
                                `profileSections.institutions_across_world.institutions.${idx}.country`,
                              )}
                            />
                            <Input
                              placeholder="Logo URL"
                              className="flex-1"
                              {...register(
                                `profileSections.institutions_across_world.institutions.${idx}.logo`,
                              )}
                            />
                            <Input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="max-w-[220px]"
                              disabled={
                                uploadingField ===
                                `profileSections.institutions_across_world.institutions.${idx}.logo`
                              }
                              onChange={(e) =>
                                handleImageUpload(
                                  e.target.files?.[0] ?? null,
                                  `profileSections.institutions_across_world.institutions.${idx}.logo`,
                                  `institutions/logos-${idx}`,
                                )
                              }
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setValue(
                                  "profileSections.institutions_across_world.institutions",
                                  globalInstitutions.filter(
                                    (_: any, i: number) => i !== idx,
                                  ),
                                );
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 6. COMMUTE TAB */}
            {activeTab === "commute" && (
              <Card className="border border-border/80 shadow-md bg-card/60 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-indigo-500" /> Commute &
                    Accessibility
                  </CardTitle>
                  <CardDescription>
                    Configure pickup points, route timings, bus details, and
                    commuter conduct policy.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="commuteTitle" className="font-semibold">
                        Section Title
                      </Label>
                      <Input
                        id="commuteTitle"
                        placeholder="Commute"
                        {...register("profileSections.commute.title")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">
                        Selected Pickup Point
                      </Label>
                      <Input
                        placeholder="HSR Layout"
                        {...register(
                          "profileSections.commute.selected_pickup_point",
                        )}
                      />
                    </div>
                  </div>

                  {/* Pickup points */}
                  <div className="space-y-4 pt-4 border-t border-border/40">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
                        Pickup Points
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue("profileSections.commute.pickup_points", [
                            ...commutePickupPoints,
                            "",
                          ]);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Pickup Point
                      </Button>
                    </div>
                    {commutePickupPoints.map((item: string, idx: number) => (
                      <div key={idx} className="flex gap-2 items-center pl-2">
                        <Input
                          placeholder="Pickup point name"
                          className="h-9 flex-1"
                          value={item || ""}
                          onChange={(e) => {
                            const next = [...commutePickupPoints];
                            next[idx] = e.target.value;
                            setValue(
                              "profileSections.commute.pickup_points",
                              next,
                            );
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setValue(
                              "profileSections.commute.pickup_points",
                              commutePickupPoints.filter(
                                (_: any, i: number) => i !== idx,
                              ),
                            );
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Routes */}
                  <div className="space-y-4 pt-4 border-t border-border/40">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
                        Routes
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue("profileSections.commute.routes", [
                            ...commuteRoutes,
                            createEmptyCommuteRoute(),
                          ]);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Route
                      </Button>
                    </div>
                    {commuteRoutes.length === 0 ? (
                      <p className="text-sm text-muted-foreground border border-dashed rounded-lg p-4">
                        No commute route configured yet.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {commuteRoutes.map((route: any, routeIdx: number) => (
                          <div
                            key={routeIdx}
                            className="border rounded-xl p-4 space-y-4 bg-muted/15"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="font-semibold text-indigo-900">
                                Route #{routeIdx + 1}
                              </h5>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => {
                                  setValue(
                                    "profileSections.commute.routes",
                                    commuteRoutes.filter(
                                      (_: any, i: number) => i !== routeIdx,
                                    ),
                                  );
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Remove Route
                              </Button>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-1">
                                <Label className="text-xs">Pickup Point</Label>
                                <Input
                                  placeholder="HSR Layout"
                                  {...register(
                                    `profileSections.commute.routes.${routeIdx}.pickup_point`,
                                  )}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Route Name</Label>
                                <Input
                                  placeholder="Route 12 - HSR Layout"
                                  {...register(
                                    `profileSections.commute.routes.${routeIdx}.route_name`,
                                  )}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Via</Label>
                                <Input
                                  placeholder="Via BTM Layout, Madivala"
                                  {...register(
                                    `profileSections.commute.routes.${routeIdx}.via`,
                                  )}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Status</Label>
                                <select
                                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                  {...register(
                                    `profileSections.commute.routes.${routeIdx}.status`,
                                  )}
                                >
                                  <option value="VERIFIED">VERIFIED</option>
                                  <option value="UNVERIFIED">UNVERIFIED</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-1">
                                <Label className="text-xs">
                                  Morning Timing Window
                                </Label>
                                <Input
                                  placeholder="6:45 AM - 8:10 AM"
                                  {...register(
                                    `profileSections.commute.routes.${routeIdx}.timings.0.time`,
                                  )}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">
                                  Evening Timing Window
                                </Label>
                                <Input
                                  placeholder="4:30 PM - 6:15 PM"
                                  {...register(
                                    `profileSections.commute.routes.${routeIdx}.timings.1.time`,
                                  )}
                                />
                              </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-1">
                                <Label className="text-xs">
                                  Transport Fee Amount
                                </Label>
                                <Input
                                  placeholder="₹25,000 / Year"
                                  {...register(
                                    `profileSections.commute.routes.${routeIdx}.transport_fee.amount`,
                                  )}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">
                                  Payment Structure
                                </Label>
                                <Input
                                  placeholder="Installment details"
                                  {...register(
                                    `profileSections.commute.routes.${routeIdx}.transport_fee.payment_structure`,
                                  )}
                                />
                              </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-3">
                              <div className="space-y-1">
                                <Label className="text-xs">
                                  Bus Registration
                                </Label>
                                <Input
                                  placeholder="KA-01-F-4829"
                                  {...register(
                                    `profileSections.commute.routes.${routeIdx}.bus_information.registration_number`,
                                  )}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Seats</Label>
                                <Input
                                  type="number"
                                  placeholder="42"
                                  {...register(
                                    `profileSections.commute.routes.${routeIdx}.bus_information.seats`,
                                    { valueAsNumber: true },
                                  )}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Model</Label>
                                <Input
                                  placeholder="Tata Marcopolo (AC)"
                                  {...register(
                                    `profileSections.commute.routes.${routeIdx}.bus_information.model`,
                                  )}
                                />
                              </div>
                            </div>

                            <div className="space-y-3 pt-2 border-t border-border/40">
                              <div className="flex items-center justify-between">
                                <h6 className="text-xs font-bold uppercase text-indigo-900">
                                  Morning Pickup Points
                                </h6>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const next = [...commuteRoutes];
                                    const current =
                                      next[routeIdx]?.morning_pickup_points ||
                                      [];
                                    next[routeIdx] = {
                                      ...next[routeIdx],
                                      morning_pickup_points: [
                                        ...current,
                                        createEmptyCommuteStop(),
                                      ],
                                    };
                                    setValue(
                                      "profileSections.commute.routes",
                                      next,
                                    );
                                  }}
                                >
                                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                                  Morning Stop
                                </Button>
                              </div>
                              {(route.morning_pickup_points || []).map(
                                (stop: any, stopIdx: number) => (
                                  <div
                                    key={stopIdx}
                                    className="grid gap-2 md:grid-cols-3"
                                  >
                                    <Input
                                      placeholder="Point"
                                      {...register(
                                        `profileSections.commute.routes.${routeIdx}.morning_pickup_points.${stopIdx}.point`,
                                      )}
                                    />
                                    <Input
                                      placeholder="Landmark"
                                      {...register(
                                        `profileSections.commute.routes.${routeIdx}.morning_pickup_points.${stopIdx}.landmark`,
                                      )}
                                    />
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="Time"
                                        {...register(
                                          `profileSections.commute.routes.${routeIdx}.morning_pickup_points.${stopIdx}.time`,
                                        )}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const next = [...commuteRoutes];
                                          const current =
                                            next[routeIdx]
                                              ?.morning_pickup_points || [];
                                          next[routeIdx] = {
                                            ...next[routeIdx],
                                            morning_pickup_points:
                                              current.filter(
                                                (_: any, i: number) =>
                                                  i !== stopIdx,
                                              ),
                                          };
                                          setValue(
                                            "profileSections.commute.routes",
                                            next,
                                          );
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>

                            <div className="space-y-3 pt-2 border-t border-border/40">
                              <div className="flex items-center justify-between">
                                <h6 className="text-xs font-bold uppercase text-indigo-900">
                                  Evening Dropoff Points
                                </h6>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const next = [...commuteRoutes];
                                    const current =
                                      next[routeIdx]?.evening_dropoff_points ||
                                      [];
                                    next[routeIdx] = {
                                      ...next[routeIdx],
                                      evening_dropoff_points: [
                                        ...current,
                                        createEmptyCommuteStop(),
                                      ],
                                    };
                                    setValue(
                                      "profileSections.commute.routes",
                                      next,
                                    );
                                  }}
                                >
                                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                                  Evening Stop
                                </Button>
                              </div>
                              {(route.evening_dropoff_points || []).map(
                                (stop: any, stopIdx: number) => (
                                  <div
                                    key={stopIdx}
                                    className="grid gap-2 md:grid-cols-3"
                                  >
                                    <Input
                                      placeholder="Point"
                                      {...register(
                                        `profileSections.commute.routes.${routeIdx}.evening_dropoff_points.${stopIdx}.point`,
                                      )}
                                    />
                                    <Input
                                      placeholder="Landmark"
                                      {...register(
                                        `profileSections.commute.routes.${routeIdx}.evening_dropoff_points.${stopIdx}.landmark`,
                                      )}
                                    />
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="Time"
                                        {...register(
                                          `profileSections.commute.routes.${routeIdx}.evening_dropoff_points.${stopIdx}.time`,
                                        )}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const next = [...commuteRoutes];
                                          const current =
                                            next[routeIdx]
                                              ?.evening_dropoff_points || [];
                                          next[routeIdx] = {
                                            ...next[routeIdx],
                                            evening_dropoff_points:
                                              current.filter(
                                                (_: any, i: number) =>
                                                  i !== stopIdx,
                                              ),
                                          };
                                          setValue(
                                            "profileSections.commute.routes",
                                            next,
                                          );
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rules and code of conduct */}
                  <div className="space-y-4 pt-4 border-t border-border/40">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
                      Rules & Code Of Conduct
                    </h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Title</Label>
                        <Input
                          placeholder="Rules & Code of Conduct"
                          {...register(
                            "profileSections.commute.rules_and_code_of_conduct.title",
                          )}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Subtitle</Label>
                        <Input
                          placeholder="Detailed guidelines for student commuters"
                          {...register(
                            "profileSections.commute.rules_and_code_of_conduct.subtitle",
                          )}
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-xs">Intro</Label>
                        <Textarea
                          rows={2}
                          placeholder="Intro text shown above rules"
                          {...register(
                            "profileSections.commute.rules_and_code_of_conduct.intro",
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Rule Items</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue(
                            "profileSections.commute.rules_and_code_of_conduct.rules",
                            [
                              ...commuteRules,
                              {
                                title: "",
                                description: "",
                              },
                            ],
                          );
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Rule
                      </Button>
                    </div>

                    {commuteRules.map((rule: any, idx: number) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-3 bg-muted/10 space-y-2"
                      >
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder="Rule title"
                            {...register(
                              `profileSections.commute.rules_and_code_of_conduct.rules.${idx}.title`,
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setValue(
                                "profileSections.commute.rules_and_code_of_conduct.rules",
                                commuteRules.filter(
                                  (_: any, i: number) => i !== idx,
                                ),
                              );
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <Textarea
                          rows={2}
                          placeholder="Rule description"
                          {...register(
                            `profileSections.commute.rules_and_code_of_conduct.rules.${idx}.description`,
                          )}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Raw payload helper */}
                  <div className="space-y-2 pt-4 border-t border-border/40">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Commute Payload (Preview)
                    </Label>
                    <Textarea
                      rows={10}
                      value={JSON.stringify(
                        {
                          tab: "commute",
                          pickup_points: commutePickupPoints,
                          selected_pickup_point: watch(
                            "profileSections.commute.selected_pickup_point",
                          ),
                          routes: commuteRoutes,
                          rules_and_code_of_conduct: watch(
                            "profileSections.commute.rules_and_code_of_conduct",
                          ),
                        },
                        null,
                        2,
                      )}
                      readOnly
                      className="font-mono text-xs"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB FOOTER NAVIGATION */}
            <div className="flex justify-between items-center pt-8 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  const currentIdx = PROFILE_TABS.findIndex(
                    (t) => t.id === activeTab,
                  );
                  if (currentIdx > 0) {
                    setActiveTab(PROFILE_TABS[currentIdx - 1].id);
                  } else {
                    router.push(getPortalPath(collegeSlug, "/setup/campuses"));
                  }
                }}
              >
                Back
              </Button>

              <div className="flex gap-3">
                {PROFILE_TABS.findIndex((t) => t.id === activeTab) <
                PROFILE_TABS.length - 1 ? (
                  <Button
                    type="button"
                    size="lg"
                    className="bg-zinc-800 hover:bg-zinc-900 text-white"
                    onClick={() => {
                      const currentIdx = PROFILE_TABS.findIndex(
                        (t) => t.id === activeTab,
                      );
                      setActiveTab(PROFILE_TABS[currentIdx + 1].id);
                    }}
                  >
                    Next Tab <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md"
                    onClick={() =>
                      router.push(getPortalPath(collegeSlug, "/setup/campuses"))
                    }
                  >
                    Continue to Campuses <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
