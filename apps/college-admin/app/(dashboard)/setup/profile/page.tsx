"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
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
  Image as ImageIcon,
  ImagePlus,
  ChevronDown,
  Award,
  BarChart3,
  Sparkle,
  Quote,
  Link2,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useCollegeProfile,
  useUpdateCollegeProfile,
} from "@/hooks/use-colleges";
import {
  useCollegeGallery,
  useCreateCollegeGalleryItem,
  useDeleteCollegeGalleryItem,
} from "@/hooks/use-facilities";
import {
  getDefaultCollegeOverviewAmenities,
  isFixedCollegeAmenity,
  mergeCollegeOverviewAmenities,
  resolveCollegeAmenityIcon,
} from "@beaconu/utils";
import { uploadCollegeAdminFile } from "@/lib/services/colleges.service";
import { IconPickerField } from "@/components/icon-picker";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { getCollegeSlugFromPath, getPortalPath } from "@/lib/portal-path";
import type { PublicGalleryItem } from "@beaconu/types";

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
  {
    id: "gallery",
    label: "Gallery",
    icon: ImageIcon,
    desc: "Campus photos shown on your public landing page",
  },
] as const;

type ProfileTabId = (typeof PROFILE_TABS)[number]["id"];

const COLLEGE_TYPE_OPTIONS = [
  "Autonomous College",
  "Government College",
  "Government-Aided College",
  "Private College",
  "Deemed University",
  "Private Self-Financing College",
] as const;

// College Overview — sub-schemas for each repeatable array, plus the
// section object itself. Field-level `.optional()` so an empty/half-filled
// form still passes; rows that ARE filled in get real validation.
const overviewAccoladeSchema = z.object({
  tag: z.string().max(30).optional(),
  title: z.string().min(1, "Title is required").max(120),
  image: z.string().optional(),
});

const overviewUniversityDetailSchema = z.object({
  label: z.string().max(60).optional(),
  value: z.string().max(120).optional(),
});

const overviewCampusStatSchema = z.object({
  value: z.string().min(1, "Value is required").max(20),
  label: z.string().min(1, "Label is required").max(40),
});

const overviewAmenitySchema = z.object({
  label: z.string().max(60).optional(),
  icon: z.string().optional(),
});

const overviewFacilitySchema = z.object({
  label: z.string().min(1, "Label is required").max(80),
  subtitle: z.string().max(120).optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
});

const overviewAchievementSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  subtitle: z.string().max(120).optional(),
  image: z.string().optional(),
});

const overviewTestimonialSchema = z.object({
  quote: z.string().min(1, "Quote is required").max(1000),
  name: z.string().max(120).optional(),
  role_lines: z.array(z.string().max(60)).optional(),
  image: z.string().optional(),
});

const overviewSocialLinkSchema = z.object({
  platform: z.string().max(40).optional(),
  icon: z.string().optional(),
  url: z.string().min(1, "URL is required").url("Enter a valid URL"),
});

const overviewLocationSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  map_link: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  address: z.string().max(300).optional(),
});

const overviewNearbyItemSchema = z.object({
  name: z.string().max(120).optional(),
  distance: z.string().max(40).optional(),
});

const overviewNearbyAccessSchema = z.object({
  category: z.string().max(60).optional(),
  items: z.array(overviewNearbyItemSchema).optional(),
});

const overviewCampusReelSchema = z.object({
  title: z.string().max(120).optional(),
  duration: z.string().max(30).optional(),
  date: z.string().max(30).optional(),
  video: z.string().min(1, "Video URL is required").url("Enter a valid URL"),
  thumbnail: z.string().optional(),
  type: z.enum(["youtube", "mp4"]).optional(),
});

const collegeOverviewSchema = z
  .object({
    id: z.string().optional(),
    enabled: z.boolean().optional(),
    name: z.string().optional(),
    navigation_tabs: z.array(z.string()).optional(),
    alt_name: z.string().max(150).optional(),
    location_name: z.string().max(150).optional(),
    type: z.string().max(150).optional(),
    established: z.coerce
      .number()
      .int()
      .min(1800)
      .max(new Date().getFullYear())
      .optional(),
    about: z.string().max(2000).optional(),
    about_image: z.string().optional(),
    admissions_cta_image: z.string().optional(),
    accolades: z.array(overviewAccoladeSchema).optional(),
    university_details: z.array(overviewUniversityDetailSchema).optional(),
    campus_stats: z.array(overviewCampusStatSchema).max(4).optional(),
    amenities: z.array(overviewAmenitySchema).optional(),
    inside_campus_facilities: z.array(overviewFacilitySchema).optional(),
    achievements: z.array(overviewAchievementSchema).optional(),
    testimonials: z.array(overviewTestimonialSchema).optional(),
    social: z.array(overviewSocialLinkSchema).optional(),
    location: overviewLocationSchema.optional(),
    nearby_access: z.array(overviewNearbyAccessSchema).optional(),
    campus_ambassadors: z.array(z.any()).optional(),
    campus_reels: z.array(overviewCampusReelSchema).optional(),
  })
  .passthrough();

// Student Code of Conduct
const conductRuleSchema = z.object({
  number: z.coerce.number().int().optional(),
  rule: z.string().min(1, "Rule text is required").max(1000),
});

const studentCodeOfConductSchema = z
  .object({
    id: z.string().optional(),
    enabled: z.boolean().optional(),
    tab: z.string().optional(),
    section_title: z.string().max(150).optional(),
    rules: z.array(conductRuleSchema).optional(),
  })
  .passthrough();

// Happenings
const happeningItemSchema = z.object({
  category: z.string().max(60).optional(),
  date: z.string().max(40).optional(),
  title: z.string().min(1, "Title is required").max(150),
  description: z.string().max(500).optional(),
  image: z.string().optional(),
  link: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

const happeningsSchema = z
  .object({
    id: z.string().optional(),
    enabled: z.boolean().optional(),
    title: z.string().max(150).optional(),
    filters: z.any().optional(),
    happenings: z.array(happeningItemSchema).optional(),
  })
  .passthrough();

// Global Presence (Institutions Across the World)
const globalInstitutionSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  country: z.string().max(100).optional(),
  logo: z.string().optional(),
});

const institutionsAcrossWorldSchema = z
  .object({
    id: z.string().optional(),
    enabled: z.boolean().optional(),
    title: z.string().max(150).optional(),
    institutions: z.array(globalInstitutionSchema).optional(),
    group: z.any().optional(),
  })
  .passthrough();

// Commute & Access
const commuteStopSchema = z.object({
  point: z.string().min(1, "Pickup point is required").max(150),
  landmark: z.string().max(150).optional(),
  time: z.string().max(60).optional(),
});

const commuteRouteSchema = z
  .object({
    pickup_point: z.string().max(150).optional(),
    route_name: z.string().min(1, "Route name is required").max(150),
    via: z.string().max(200).optional(),
    status: z.enum(["VERIFIED", "UNVERIFIED"]).optional(),
    timings: z
      .array(z.object({ time: z.string().max(60).optional() }))
      .optional(),
    transport_fee: z
      .object({
        amount: z.string().max(60).optional(),
        payment_structure: z.string().max(200).optional(),
      })
      .optional(),
    bus_information: z
      .object({
        registration_number: z.string().max(40).optional(),
        seats: z.coerce.number().int().min(0).optional(),
        model: z.string().max(100).optional(),
      })
      .optional(),
    morning_pickup_points: z.array(commuteStopSchema).optional(),
    evening_dropoff_points: z.array(commuteStopSchema).optional(),
  })
  .passthrough();

const commuteRuleSchema = z.object({
  title: z.string().min(1, "Title is required").max(150),
  description: z.string().max(500).optional(),
});

const commuteRulesAndCodeOfConductSchema = z.object({
  title: z.string().max(150).optional(),
  subtitle: z.string().max(200).optional(),
  intro: z.string().max(500).optional(),
  rules: z.array(commuteRuleSchema).optional(),
});

const commuteSchema = z
  .object({
    id: z.string().optional(),
    enabled: z.boolean().optional(),
    tab: z.string().optional(),
    title: z.string().max(150).optional(),
    pickup_points: z.array(z.unknown()).optional(),
    selected_pickup_point: z.string().optional(),
    routes: z.array(commuteRouteSchema).optional(),
    rules_and_code_of_conduct: commuteRulesAndCodeOfConductSchema.optional(),
  })
  .passthrough();

const profileSchema = z.object({
  name: z.string().min(2, "College name must be at least 2 characters"),
  code: z.string().min(2, "College code must be at least 2 characters"),
  leadId: z.string().optional().nullable(),
  addressFromLead: z.boolean().default(false),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  collegeType: z.string().optional().nullable(),
  pinCode: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  requestedGroupCode: z.string().optional().nullable(),
  profileSections: z.object({
    college_overview: collegeOverviewSchema.optional(),
    student_code_of_conduct: studentCodeOfConductSchema.optional(),
    happenings: happeningsSchema.optional(),
    institutions_across_world: institutionsAcrossWorldSchema.optional(),
    commute: commuteSchema.optional(),
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
  // College Overview: which of the 6 sub-cards are expanded ("Basics" is
  // open by default; the rest start collapsed).
  const [openOverviewCards, setOpenOverviewCards] = useState<Set<string>>(
    () => new Set(["basics"]),
  );
  const toggleOverviewCard = (card: string) => {
    setOpenOverviewCards((prev) => {
      const next = new Set(prev);
      if (next.has(card)) next.delete(card);
      else next.add(card);
      return next;
    });
  };
  // Shared delete-confirmation target for every repeatable array in the
  // College Overview tab: { section: <array field path>, index }.
  const [overviewDeleteTarget, setOverviewDeleteTarget] = useState<{
    section: string;
    index: number;
  } | null>(null);
  // Shared delete-confirmation target for the four remaining tabs (Student
  // Conduct, Happenings, Global Presence, Commute). `routeIndex` is only set
  // for Commute's nested morning/evening stop deletes.
  const [otherTabsDeleteTarget, setOtherTabsDeleteTarget] = useState<{
    section:
      | "student_code_of_conduct.rules"
      | "happenings.happenings"
      | "institutions_across_world.institutions"
      | "commute.routes"
      | "commute.rules_and_code_of_conduct.rules"
      | "commute.routes.morning_pickup_points"
      | "commute.routes.evening_dropoff_points";
    index: number;
    routeIndex?: number;
  } | null>(null);
  const {
    data: profile,
    isLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useCollegeProfile();
  const { mutate: updateProfile, isPending } = useUpdateCollegeProfile();
  // Guards the form-hydration effect below so a background refetch of
  // `profile` (e.g. on window refocus) can't wipe in-progress edits —
  // including an already-uploaded logo/cover URL — by re-running `reset()`.
  const hasHydratedFormRef = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema as any),
    defaultValues: {
      addressFromLead: false,
      profileSections: {},
    },
  });

  useEffect(() => {
    if (profile && !hasHydratedFormRef.current) {
      hasHydratedFormRef.current = true;
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
              latitude: undefined,
              longitude: undefined,
              map_link: "",
            },
            nearby_access: [],
            campus_ambassadors: [],
            social: [],
            campus_reels: [],
          };

      reset({
        // The hydration payload is assembled from loosely-typed API data
        // (profile.profileSections is a JSON blob) and merged with default
        // scaffolding objects above — it's intentionally reset() input, not
        // committed form state, so a structural cast here is safe.
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
        collegeType: profile.collegeType || "",
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
      } as ProfileFormData);
    }
  }, [profile, reset]);

  // Student Code of Conduct, Happenings, Global Presence — each repeatable
  // array on its own useFieldArray (mirrors College Overview's pattern).
  // `control` is cast to `any` at every `useFieldArray` call in this
  // component (matching the escape hatch `NearbyAccessGroup`/
  // `TestimonialFields` already use below) — once `profileSections` grew to
  // include the fully-typed `commuteSchema`, RHF's `FieldArrayPath<T>`
  // template-literal type collapsed to `never` for ALL `useFieldArray` calls
  // sharing this form (a known RHF/TS recursion-depth limitation), not just
  // commute's own. This is compile-time only — runtime validation still goes
  // through the real per-section Zod schemas via the resolver.
  const conductRulesArray = useFieldArray({
    control: control as any,
    name: "profileSections.student_code_of_conduct.rules",
  });
  const happeningsArray = useFieldArray({
    control: control as any,
    name: "profileSections.happenings.happenings",
  });
  const globalInstitutionsArray = useFieldArray({
    control: control as any,
    name: "profileSections.institutions_across_world.institutions",
  });
  // Watched mirrors used only for live preview values (image URLs etc.)
  // alongside the useFieldArray-backed inputs above.
  const happeningsWatch = watch("profileSections.happenings.happenings") || [];
  const globalInstitutionsWatch =
    watch("profileSections.institutions_across_world.institutions") || [];
  const globalInstitutionsGroup = watch(
    "profileSections.institutions_across_world.group",
  );

  // Overview — singular fields (not arrays)
  const overviewAboutImage = watch(
    "profileSections.college_overview.about_image",
  );
  const overviewAdmissionsCtaImage = watch(
    "profileSections.college_overview.admissions_cta_image",
  );
  const overviewAltName = watch("profileSections.college_overview.alt_name");
  const overviewAbout = watch("profileSections.college_overview.about");

  // Overview — repeatable arrays, each on its own useFieldArray
  const accoladesArray = useFieldArray({
    control: control as any,
    name: "profileSections.college_overview.accolades",
  });
  const universityDetailsArray = useFieldArray({
    control: control as any,
    name: "profileSections.college_overview.university_details",
  });
  const campusStatsArray = useFieldArray({
    control: control as any,
    name: "profileSections.college_overview.campus_stats",
  });
  const facilitiesArray = useFieldArray({
    control: control as any,
    name: "profileSections.college_overview.inside_campus_facilities",
  });
  const achievementsArray = useFieldArray({
    control: control as any,
    name: "profileSections.college_overview.achievements",
  });
  const testimonialsArray = useFieldArray({
    control: control as any,
    name: "profileSections.college_overview.testimonials",
  });
  const socialLinksArray = useFieldArray({
    control: control as any,
    name: "profileSections.college_overview.social",
  });
  const reelsArray = useFieldArray({
    control: control as any,
    name: "profileSections.college_overview.campus_reels",
  });
  const nearbyAccessArray = useFieldArray({
    control: control as any,
    name: "profileSections.college_overview.nearby_access",
  });

  // Amenities keep hand-rolled watch/setValue (not a plain useFieldArray)
  // because fixed default amenities (Wi-Fi, Toiletries, ...) are merged in
  // on hydration and branch differently in the UI (no icon picker, see
  // isFixedCollegeAmenity below) from custom ones.
  const overviewAmenities =
    watch("profileSections.college_overview.amenities") || [];

  // Watched mirrors of a few array fields, used only to render live
  // previews (image/icon) next to their useFieldArray-backed inputs above.
  const overviewFacilitiesWatch =
    watch("profileSections.college_overview.inside_campus_facilities") || [];
  const overviewAccolades =
    watch("profileSections.college_overview.accolades") || [];
  const overviewAchievements =
    watch("profileSections.college_overview.achievements") || [];
  const overviewTestimonials =
    watch("profileSections.college_overview.testimonials") || [];
  const overviewReels =
    watch("profileSections.college_overview.campus_reels") || [];
  const overviewCampusStatsWatch =
    watch("profileSections.college_overview.campus_stats") || [];
  const overviewSocialWatch =
    watch("profileSections.college_overview.social") || [];
  const conductRulesWatch =
    watch("profileSections.student_code_of_conduct.rules") || [];
  const commuteRoutesWatch = watch("profileSections.commute.routes") || [];
  const commuteRulesWatch =
    watch("profileSections.commute.rules_and_code_of_conduct.rules") || [];

  // Guard against stacking up empty array items: disable an "Add" button
  // until every already-added item has its required field(s) filled in.
  // `fields` are plain string keys checked for non-empty-after-trim.
  function isLastItemIncomplete(items: any[], ...fields: string[]): boolean {
    if (items.length === 0) return false;
    const last = items[items.length - 1];
    return fields.some((f) => !String(last?.[f] ?? "").trim());
  }

  // Map picker
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapScriptLoaded, setMapScriptLoaded] = useState(false);
  const overviewLat = watch(
    "profileSections.college_overview.location.latitude",
  );
  const overviewLng = watch(
    "profileSections.college_overview.location.longitude",
  );

  useEffect(() => {
    if ((window as any).google?.maps) {
      setMapScriptLoaded(true);
      return;
    }
    if (document.querySelector("script[data-beaconu-gm]")) return;
    const script = document.createElement("script");
    script.setAttribute("data-beaconu-gm", "1");
    script.src =
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyBk9DCaKvJp9IejQ9-MCs";
    script.async = true;
    script.onload = () => setMapScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Reset map instance when leaving the tab so it re-inits on return
  useEffect(() => {
    if (activeTab !== "college_overview") {
      mapInstanceRef.current = null;
      markerRef.current = null;
    }
  }, [activeTab]);

  useEffect(() => {
    // Re-runs when script loads OR when tab switches to college_overview
    // (the div only exists in the DOM when that tab is active)
    if (!mapScriptLoaded || !mapContainerRef.current || mapInstanceRef.current)
      return;
    const lat = overviewLat ? Number(overviewLat) : 20.5937;
    const lng = overviewLng ? Number(overviewLng) : 78.9629;
    const map = new (window as any).google.maps.Map(mapContainerRef.current, {
      center: { lat, lng },
      zoom: overviewLat ? 14 : 5,
    });
    mapInstanceRef.current = map;
    if (overviewLat && overviewLng) {
      markerRef.current = new (window as any).google.maps.Marker({
        position: { lat, lng },
        map,
      });
    }
    map.addListener("click", (e: any) => {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      setValue("profileSections.college_overview.location.latitude", newLat);
      setValue("profileSections.college_overview.location.longitude", newLng);
      setValue(
        "profileSections.college_overview.location.map_link",
        `https://maps.google.com/?q=${newLat},${newLng}`,
      );
      if (markerRef.current) {
        markerRef.current.setPosition(e.latLng);
      } else {
        markerRef.current = new (window as any).google.maps.Marker({
          position: e.latLng,
          map,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapScriptLoaded, activeTab]);

  // Commute arrays (see `control as any` note above).
  const commuteRoutesArray = useFieldArray({
    control: control as any,
    name: "profileSections.commute.routes",
  });
  const commuteRulesArray = useFieldArray({
    control: control as any,
    name: "profileSections.commute.rules_and_code_of_conduct.rules",
  });

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
        collegeType: data.collegeType || undefined,
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

  // Runs when Zod validation blocks the save. Since all 7 tabs share one
  // form, a required-field error can live on a tab the admin isn't looking
  // at right now — switch to the first tab with an error and name it in the
  // toast so the failure is never silent.
  const onInvalid = (formErrors: typeof errors) => {
    const tabWithError = PROFILE_TABS.find((tab) => {
      if (tab.id === "basic") return !!(formErrors.name || formErrors.code);
      if (tab.id === "gallery") return false;
      return !!(formErrors.profileSections as any)?.[tab.id];
    });
    if (tabWithError && tabWithError.id !== activeTab) {
      setActiveTab(tabWithError.id as ProfileTabId);
    }
    toast.error(
      tabWithError
        ? `Fix the highlighted fields in "${tabWithError.label}" before saving.`
        : "Please fix the highlighted fields before saving.",
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

  if (profileError) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <p className="text-destructive">Failed to load profile.</p>
        <Button variant="outline" onClick={() => refetchProfile()}>
          Try again
        </Button>
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

        <div className="flex items-center gap-3">
          {isDirty && !isPending && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Unsaved changes
            </span>
          )}
          <Button
            onClick={handleSubmit(onSubmit, onInvalid)}
            disabled={isPending}
            size="lg"
            className="shadow-md transition-all font-semibold"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            Save Settings
          </Button>
        </div>
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
                    ? "bg-primary/5 border-primary/30 text-primary shadow-sm font-semibold ring-1 ring-primary/20"
                    : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
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
          <form
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            className="space-y-8"
          >
            {/* 1. BASIC INFO TAB */}
            {activeTab === "basic" && (
              <Card className="border border-border/80 shadow-md bg-card/60 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" /> Basic Details
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
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
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
                        htmlFor="collegeType"
                        className="font-semibold text-foreground"
                      >
                        College Type
                      </Label>
                      <Controller
                        name="collegeType"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value || ""}
                            onValueChange={(v) => field.onChange(v)}
                          >
                            <SelectTrigger id="collegeType">
                              <SelectValue placeholder="Select college type" />
                            </SelectTrigger>
                            <SelectContent>
                              {COLLEGE_TYPE_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
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
                        Logo Image
                      </Label>
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
                        Cover Image
                      </Label>
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
              <div className="space-y-6">
                {/* Card A — Basics */}
                <OverviewCard
                  id="basics"
                  icon={Compass}
                  title="Basics"
                  description="Name, type, established year, about text, and hero images."
                  badge={
                    overviewAbout || overviewAltName ? "Configured" : "Not set"
                  }
                  open={openOverviewCards.has("basics")}
                  onToggle={toggleOverviewCard}
                >
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
                      {errors.profileSections?.college_overview?.alt_name && (
                        <p className="text-xs text-destructive">
                          {
                            errors.profileSections.college_overview.alt_name
                              .message
                          }
                        </p>
                      )}
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
                      {errors.profileSections?.college_overview
                        ?.established && (
                        <p className="text-xs text-destructive">
                          {
                            errors.profileSections.college_overview.established
                              .message
                          }
                        </p>
                      )}
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
                      {errors.profileSections?.college_overview?.about && (
                        <p className="text-xs text-destructive">
                          {
                            errors.profileSections.college_overview.about
                              .message
                          }
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="font-semibold">
                        About Section Image
                      </Label>
                      <ImageUpload
                        value={overviewAboutImage || ""}
                        onChange={(url) =>
                          setValue(
                            "profileSections.college_overview.about_image",
                            url,
                            { shouldDirty: true },
                          )
                        }
                        context="college-overview/about"
                        className="max-w-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Shown alongside the About text on your public landing
                        page.
                      </p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="font-semibold">
                        Admissions CTA Image
                      </Label>
                      <ImageUpload
                        value={overviewAdmissionsCtaImage || ""}
                        onChange={(url) =>
                          setValue(
                            "profileSections.college_overview.admissions_cta_image",
                            url,
                            { shouldDirty: true },
                          )
                        }
                        context="college-overview/admissions-cta"
                        className="max-w-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Shown on the right side of the &quot;Shape Your Future
                        With Excellence&quot; admissions banner.
                      </p>
                    </div>
                  </div>
                </OverviewCard>

                {/* Card B — Recognition (accolades + university details) */}
                <OverviewCard
                  id="recognition"
                  icon={Award}
                  title="Recognition"
                  description="Accolades, ratings, and the university fact sheet."
                  badge={`${accoladesArray.fields.length} accolade${accoladesArray.fields.length === 1 ? "" : "s"}`}
                  open={openOverviewCards.has("recognition")}
                  onToggle={toggleOverviewCard}
                >
                  {/* Accolades Section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Accolades & Ratings
                    </h4>
                    {accoladesArray.fields.length === 0 && (
                      <OverviewEmptyState
                        icon={Award}
                        message="No accolades yet — click below to add your first one."
                      />
                    )}
                    <div className="space-y-3">
                      {accoladesArray.fields.map((field, idx) => (
                        <div
                          key={field.id}
                          className="grid gap-3 border p-3 rounded-lg bg-muted/20 sm:grid-cols-2"
                        >
                          <div className="sm:col-span-2">
                            <ImageUpload
                              value={overviewAccolades[idx]?.image || ""}
                              onChange={(url) =>
                                setValue(
                                  `profileSections.college_overview.accolades.${idx}.image`,
                                  url,
                                  { shouldDirty: true },
                                )
                              }
                              context={`college-overview/accolades-${idx}`}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Tag</Label>
                            <Input
                              placeholder="Tag (e.g. Rank)"
                              {...register(
                                `profileSections.college_overview.accolades.${idx}.tag`,
                              )}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Title *</Label>
                            <Input
                              placeholder="Title (e.g. MAHE Rank 3)"
                              {...register(
                                `profileSections.college_overview.accolades.${idx}.title`,
                              )}
                            />
                            {(errors.profileSections?.college_overview as any)
                              ?.accolades?.[idx]?.title && (
                              <p className="text-xs text-destructive">
                                {
                                  (
                                    errors.profileSections
                                      ?.college_overview as any
                                  ).accolades[idx]?.title?.message
                                }
                              </p>
                            )}
                          </div>
                          <div className="sm:col-span-2 flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() =>
                                setOverviewDeleteTarget({
                                  section: "accolades",
                                  index: idx,
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-2 border-dashed"
                      disabled={isLastItemIncomplete(
                        overviewAccolades,
                        "title",
                      )}
                      onClick={() =>
                        accoladesArray.append({ tag: "", title: "", image: "" })
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Accolade
                    </Button>
                  </div>

                  {/* University Details Section */}
                  <div className="space-y-4 pt-4 border-t border-border/60">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      University Fact Sheet
                    </h4>
                    {universityDetailsArray.fields.length === 0 && (
                      <OverviewEmptyState
                        icon={FileText}
                        message="No fact-sheet rows yet — click below to add your first one."
                      />
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {universityDetailsArray.fields.map((field, idx) => (
                        <div
                          key={field.id}
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
                            onClick={() =>
                              setOverviewDeleteTarget({
                                section: "university_details",
                                index: idx,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-2 border-dashed"
                      onClick={() =>
                        universityDetailsArray.append({ label: "", value: "" })
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Fact-Sheet Row
                    </Button>
                  </div>
                </OverviewCard>

                {/* Card C — Campus Stats */}
                <OverviewCard
                  id="campus_stats"
                  icon={BarChart3}
                  title="Campus Stats"
                  description="The dark stats band shown below the About section (max 4 shown publicly)."
                  badge={`${campusStatsArray.fields.length} / 4 stats`}
                  open={openOverviewCards.has("campus_stats")}
                  onToggle={toggleOverviewCard}
                >
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground">
                      Shown as the dark stats band below the About section on
                      your public landing page (e.g. &quot;130+ Staff
                      Members&quot;). Up to 4 are shown.
                    </p>
                    {campusStatsArray.fields.length === 0 && (
                      <OverviewEmptyState
                        icon={BarChart3}
                        message="No stats yet — click below to add your first one."
                      />
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {campusStatsArray.fields.map((field, idx) => (
                        <div
                          key={field.id}
                          className="flex gap-2 items-start border p-2 rounded-lg bg-muted/10"
                        >
                          <div className="flex-1">
                            <Input
                              placeholder="Value (e.g. 130+)"
                              className="h-9"
                              {...register(
                                `profileSections.college_overview.campus_stats.${idx}.value`,
                              )}
                            />
                            {(errors.profileSections?.college_overview as any)
                              ?.campus_stats?.[idx]?.value && (
                              <p className="text-xs text-destructive mt-1">
                                {
                                  (
                                    errors.profileSections
                                      ?.college_overview as any
                                  ).campus_stats[idx]?.value?.message
                                }
                              </p>
                            )}
                          </div>
                          <div className="flex-1">
                            <Input
                              placeholder="Label (e.g. Staff Members)"
                              className="h-9"
                              {...register(
                                `profileSections.college_overview.campus_stats.${idx}.label`,
                              )}
                            />
                            {(errors.profileSections?.college_overview as any)
                              ?.campus_stats?.[idx]?.label && (
                              <p className="text-xs text-destructive mt-1">
                                {
                                  (
                                    errors.profileSections
                                      ?.college_overview as any
                                  ).campus_stats[idx]?.label?.message
                                }
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setOverviewDeleteTarget({
                                section: "campus_stats",
                                index: idx,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    {campusStatsArray.fields.length >= 4 ? (
                      <p className="text-xs text-muted-foreground">
                        Maximum 4 stats — this is all that&apos;s shown on the
                        public site.
                      </p>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-2 border-dashed"
                        disabled={isLastItemIncomplete(
                          overviewCampusStatsWatch,
                          "value",
                          "label",
                        )}
                        onClick={() =>
                          campusStatsArray.append({ value: "", label: "" })
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Stat
                      </Button>
                    )}
                  </div>
                </OverviewCard>

                {/* Card D — Amenities & Facilities */}
                <OverviewCard
                  id="amenities"
                  icon={Sparkle}
                  title="Amenities & Facilities"
                  description="Campus amenities and the facilities/outlets list."
                  badge={`${overviewAmenities.length} amenities`}
                  open={openOverviewCards.has("amenities")}
                  onToggle={toggleOverviewCard}
                >
                  {/* Amenities Section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Campus Amenities
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Wi-Fi and other default amenities use fixed logos. For
                      newly added amenities, you can upload a custom logo.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {overviewAmenities.map((item: any, idx: number) => {
                        const amenityLabel = item?.label || "Amenity";
                        const amenityIcon = resolveCollegeAmenityIcon(
                          item?.icon,
                          amenityLabel,
                        );
                        const isFixedAmenity = isFixedCollegeAmenity(
                          amenityLabel,
                          item?.icon,
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
                                  {isFixedAmenity
                                    ? "Fixed global logo"
                                    : "Upload a custom logo"}
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
                                    { shouldDirty: true },
                                  );
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            {!isFixedAmenity && (
                              <IconPickerField
                                value={item?.icon}
                                onChange={(iconUrl) =>
                                  setValue(
                                    `profileSections.college_overview.amenities.${idx}.icon`,
                                    iconUrl,
                                    { shouldDirty: true },
                                  )
                                }
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-2 border-dashed"
                      onClick={() => {
                        setValue(
                          "profileSections.college_overview.amenities",
                          [...overviewAmenities, { label: "", icon: "" }],
                          { shouldDirty: true },
                        );
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Amenity
                    </Button>
                  </div>

                  {/* Inside Campus Facilities */}
                  <div className="space-y-4 pt-4 border-t border-border/60">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Campus Facilities & Outlets
                    </h4>
                    {facilitiesArray.fields.length === 0 && (
                      <OverviewEmptyState
                        icon={Building}
                        message="No facilities yet — click below to add your first one."
                      />
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {facilitiesArray.fields.map((field, idx) => (
                        <div
                          key={field.id}
                          className="border p-4 rounded-xl bg-muted/10 space-y-3 relative group"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Facility #{idx + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive h-8 px-2 hover:bg-destructive/10"
                              onClick={() =>
                                setOverviewDeleteTarget({
                                  section: "inside_campus_facilities",
                                  index: idx,
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Facility Name</Label>
                              <Input
                                placeholder="Library, Cafeteria, etc."
                                className="h-9"
                                {...register(
                                  `profileSections.college_overview.inside_campus_facilities.${idx}.label`,
                                )}
                              />
                              {(errors.profileSections?.college_overview as any)
                                ?.inside_campus_facilities?.[idx]?.label && (
                                <p className="text-xs text-destructive">
                                  {
                                    (
                                      errors.profileSections
                                        ?.college_overview as any
                                    ).inside_campus_facilities[idx]?.label
                                      ?.message
                                  }
                                </p>
                              )}
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Subtitle</Label>
                              <Input
                                placeholder="Open 24/7, AC, Wifi"
                                className="h-9"
                                {...register(
                                  `profileSections.college_overview.inside_campus_facilities.${idx}.subtitle`,
                                )}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Icon</Label>
                              <IconPickerField
                                value={overviewFacilitiesWatch[idx]?.icon}
                                onChange={(iconUrl) =>
                                  setValue(
                                    `profileSections.college_overview.inside_campus_facilities.${idx}.icon`,
                                    iconUrl,
                                    { shouldDirty: true },
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Photo</Label>
                              <ImageUpload
                                value={
                                  overviewFacilitiesWatch[idx]?.image || ""
                                }
                                onChange={(url) =>
                                  setValue(
                                    `profileSections.college_overview.inside_campus_facilities.${idx}.image`,
                                    url,
                                    { shouldDirty: true },
                                  )
                                }
                                context={`college-overview/facilities-${idx}`}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-2 border-dashed"
                      disabled={isLastItemIncomplete(
                        overviewFacilitiesWatch,
                        "label",
                      )}
                      onClick={() =>
                        facilitiesArray.append({
                          label: "",
                          subtitle: "",
                          icon: "",
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Facility
                    </Button>
                  </div>
                </OverviewCard>

                {/* Card E — Achievements & Testimonials */}
                <OverviewCard
                  id="achievements_testimonials"
                  icon={Sparkles}
                  title="Achievements & Testimonials"
                  description="Institutional achievements and student/faculty testimonials."
                  badge={`${achievementsArray.fields.length} achievements`}
                  open={openOverviewCards.has("achievements_testimonials")}
                  onToggle={toggleOverviewCard}
                >
                  {/* Achievements */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Achievements
                    </h4>
                    {achievementsArray.fields.length === 0 && (
                      <OverviewEmptyState
                        icon={Sparkles}
                        message="No achievements yet — click below to add your first one."
                      />
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievementsArray.fields.map((field, idx) => (
                        <div
                          key={field.id}
                          className="border p-4 rounded-xl bg-muted/10 space-y-3 relative group"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Achievement #{idx + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive h-8 px-2 hover:bg-destructive/10"
                              onClick={() =>
                                setOverviewDeleteTarget({
                                  section: "achievements",
                                  index: idx,
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Title</Label>
                              <Input
                                placeholder="Calicut University"
                                className="h-9"
                                {...register(
                                  `profileSections.college_overview.achievements.${idx}.title`,
                                )}
                              />
                              {(errors.profileSections?.college_overview as any)
                                ?.achievements?.[idx]?.title && (
                                <p className="text-xs text-destructive">
                                  {
                                    (
                                      errors.profileSections
                                        ?.college_overview as any
                                    ).achievements[idx]?.title?.message
                                  }
                                </p>
                              )}
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Subtitle</Label>
                              <Input
                                placeholder="A-Zone"
                                className="h-9"
                                {...register(
                                  `profileSections.college_overview.achievements.${idx}.subtitle`,
                                )}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Photo</Label>
                              <ImageUpload
                                value={overviewAchievements[idx]?.image || ""}
                                onChange={(url) =>
                                  setValue(
                                    `profileSections.college_overview.achievements.${idx}.image`,
                                    url,
                                    { shouldDirty: true },
                                  )
                                }
                                context={`college-overview/achievements-${idx}`}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-2 border-dashed"
                      disabled={isLastItemIncomplete(
                        overviewAchievements,
                        "title",
                      )}
                      onClick={() =>
                        achievementsArray.append({
                          title: "",
                          subtitle: "",
                          image: "",
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Achievement
                    </Button>
                  </div>

                  {/* Testimonials */}
                  <div className="space-y-4 pt-4 border-t border-border/60">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Sharing Experience (Testimonials)
                    </h4>
                    {testimonialsArray.fields.length === 0 && (
                      <OverviewEmptyState
                        icon={Quote}
                        message="No testimonials yet — click below to add your first one."
                      />
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {testimonialsArray.fields.map((field, idx) => (
                        <TestimonialFields
                          key={field.id}
                          idx={idx}
                          register={register}
                          control={control}
                          setValue={setValue}
                          watchValue={overviewTestimonials[idx]}
                          errors={errors}
                          onRemove={() =>
                            setOverviewDeleteTarget({
                              section: "testimonials",
                              index: idx,
                            })
                          }
                        />
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-2 border-dashed"
                      disabled={isLastItemIncomplete(
                        overviewTestimonials,
                        "quote",
                      )}
                      onClick={() =>
                        testimonialsArray.append({
                          quote: "",
                          name: "",
                          role_lines: [],
                          image: "",
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Testimonial
                    </Button>
                  </div>
                </OverviewCard>

                {/* Card F — Location, Reels & Links */}
                <OverviewCard
                  id="location_reels_links"
                  icon={MapPin}
                  title="Location, Reels & Links"
                  description="Map coordinates, nearby establishments, campus reels, and social links."
                  badge={
                    overviewLat && overviewLng ? "Location set" : "No location"
                  }
                  open={openOverviewCards.has("location_reels_links")}
                  onToggle={toggleOverviewCard}
                >
                  {/* Location Settings */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Geographic & Map Coordinates
                    </h4>

                    {/* Map Picker */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Pick Location on Map
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Click anywhere on the map to set the coordinates.
                        Latitude, Longitude and Google Maps link will be
                        auto-filled.
                      </p>
                      <div
                        ref={mapContainerRef}
                        className="w-full rounded-lg border border-border overflow-hidden"
                        style={{ height: 320 }}
                      />
                      {!mapScriptLoaded && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> Loading
                          map…
                        </p>
                      )}
                    </div>

                    {/* Lat / Lng (read from map click, editable as fallback) */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Latitude</Label>
                        <Input
                          placeholder="e.g. 17.4599791"
                          {...register(
                            "profileSections.college_overview.location.latitude",
                          )}
                          onChange={(e) => {
                            register(
                              "profileSections.college_overview.location.latitude",
                            ).onChange(e);
                            const lat = parseFloat(e.target.value);
                            const lng = Number(overviewLng);
                            if (
                              !isNaN(lat) &&
                              !isNaN(lng) &&
                              mapInstanceRef.current
                            ) {
                              const pos = { lat, lng };
                              mapInstanceRef.current.setCenter(pos);
                              mapInstanceRef.current.setZoom(14);
                              if (markerRef.current)
                                markerRef.current.setPosition(pos);
                              else
                                markerRef.current = new (
                                  window as any
                                ).google.maps.Marker({
                                  position: pos,
                                  map: mapInstanceRef.current,
                                });
                            }
                          }}
                        />
                        {(errors.profileSections?.college_overview as any)
                          ?.location?.latitude && (
                          <p className="text-xs text-destructive">
                            {
                              (errors.profileSections?.college_overview as any)
                                .location.latitude.message
                            }
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label>Longitude</Label>
                        <Input
                          placeholder="e.g. 78.3320099"
                          {...register(
                            "profileSections.college_overview.location.longitude",
                          )}
                          onChange={(e) => {
                            register(
                              "profileSections.college_overview.location.longitude",
                            ).onChange(e);
                            const lat = Number(overviewLat);
                            const lng = parseFloat(e.target.value);
                            if (
                              !isNaN(lat) &&
                              !isNaN(lng) &&
                              mapInstanceRef.current
                            ) {
                              const pos = { lat, lng };
                              mapInstanceRef.current.setCenter(pos);
                              mapInstanceRef.current.setZoom(14);
                              if (markerRef.current)
                                markerRef.current.setPosition(pos);
                              else
                                markerRef.current = new (
                                  window as any
                                ).google.maps.Marker({
                                  position: pos,
                                  map: mapInstanceRef.current,
                                });
                            }
                          }}
                        />
                        {(errors.profileSections?.college_overview as any)
                          ?.location?.longitude && (
                          <p className="text-xs text-destructive">
                            {
                              (errors.profileSections?.college_overview as any)
                                .location.longitude.message
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Google Maps Link</Label>
                        <Input
                          placeholder="Auto-filled on map click, or paste manually"
                          {...register(
                            "profileSections.college_overview.location.map_link",
                          )}
                        />
                        {(errors.profileSections?.college_overview as any)
                          ?.location?.map_link && (
                          <p className="text-xs text-destructive">
                            {
                              (errors.profileSections?.college_overview as any)
                                .location.map_link.message
                            }
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label>Address String</Label>
                        <Input
                          placeholder="Full address"
                          {...register(
                            "profileSections.college_overview.location.address",
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nearby Access Section */}
                  <div className="space-y-4 pt-4 border-t border-border/60">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Nearby Establishments
                    </h4>
                    {nearbyAccessArray.fields.length === 0 && (
                      <OverviewEmptyState
                        icon={MapPin}
                        message="No nearby establishments yet — click below to add a category."
                      />
                    )}
                    {nearbyAccessArray.fields.map((catField, catIdx) => (
                      <NearbyAccessGroup
                        key={catField.id}
                        catIdx={catIdx}
                        control={control}
                        register={register}
                        onRemoveGroup={() =>
                          setOverviewDeleteTarget({
                            section: "nearby_access",
                            index: catIdx,
                          })
                        }
                      />
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-2 border-dashed"
                      onClick={() =>
                        nearbyAccessArray.append({
                          category: "Transit",
                          items: [],
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Category Group
                    </Button>
                  </div>

                  {/* Campus Reels Section */}
                  <div className="space-y-4 pt-4 border-t border-border/60">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Campus Reels & Videos
                    </h4>
                    {reelsArray.fields.length === 0 && (
                      <OverviewEmptyState
                        icon={Play}
                        message="No reels yet — click below to add your first one."
                      />
                    )}
                    {reelsArray.fields.map((field, idx) => (
                      <div
                        key={field.id}
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
                          {(errors.profileSections?.college_overview as any)
                            ?.campus_reels?.[idx]?.video && (
                            <p className="text-xs text-destructive">
                              {
                                (
                                  errors.profileSections
                                    ?.college_overview as any
                                ).campus_reels[idx]?.video?.message
                              }
                            </p>
                          )}
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
                          <ImageUpload
                            value={overviewReels[idx]?.thumbnail || ""}
                            onChange={(url) =>
                              setValue(
                                `profileSections.college_overview.campus_reels.${idx}.thumbnail`,
                                url,
                                { shouldDirty: true },
                              )
                            }
                            context={`college-overview/reels-thumbnail-${idx}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Video Type</Label>
                          <Controller
                            name={`profileSections.college_overview.campus_reels.${idx}.type`}
                            control={control}
                            render={({ field: typeField }) => (
                              <Select
                                value={typeField.value || "youtube"}
                                onValueChange={(v) => typeField.onChange(v)}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Select video type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="youtube">
                                    YouTube
                                  </SelectItem>
                                  <SelectItem value="mp4">MP4 Video</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-destructive h-9"
                            onClick={() =>
                              setOverviewDeleteTarget({
                                section: "campus_reels",
                                index: idx,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Remove Reel
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-2 border-dashed"
                      disabled={isLastItemIncomplete(overviewReels, "video")}
                      onClick={() =>
                        reelsArray.append({
                          title: "",
                          duration: "",
                          date: "",
                          video: "",
                          thumbnail: "",
                          type: "youtube",
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Reel
                    </Button>
                  </div>

                  {/* Social Links */}
                  <div className="space-y-4 pt-4 border-t border-border/60">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Social Links
                    </h4>
                    {socialLinksArray.fields.length === 0 && (
                      <OverviewEmptyState
                        icon={Link2}
                        message="No social links yet — click below to add your first one."
                      />
                    )}
                    <div className="space-y-3">
                      {socialLinksArray.fields.map((field, idx) => (
                        <div
                          key={field.id}
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
                          <div>
                            <Input
                              placeholder="https://example.com/profile"
                              className="h-9"
                              {...register(
                                `profileSections.college_overview.social.${idx}.url`,
                              )}
                            />
                            {(errors.profileSections?.college_overview as any)
                              ?.social?.[idx]?.url && (
                              <p className="text-xs text-destructive">
                                {
                                  (
                                    errors.profileSections
                                      ?.college_overview as any
                                  ).social[idx]?.url?.message
                                }
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setOverviewDeleteTarget({
                                section: "social",
                                index: idx,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-2 border-dashed"
                      disabled={isLastItemIncomplete(
                        overviewSocialWatch,
                        "url",
                      )}
                      onClick={() =>
                        socialLinksArray.append({
                          platform: "",
                          icon: "",
                          url: "",
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Social Link
                    </Button>
                  </div>
                </OverviewCard>

                {/* Shared delete-confirmation dialog for every repeatable
                    array above (accolades, facilities, achievements, ...) */}
                <ConfirmDialog
                  open={overviewDeleteTarget !== null}
                  title="Remove Item"
                  description="Remove this item? This cannot be undone until you save."
                  confirmLabel="Remove"
                  variant="destructive"
                  onCancel={() => setOverviewDeleteTarget(null)}
                  onConfirm={() => {
                    if (!overviewDeleteTarget) return;
                    const { section, index } = overviewDeleteTarget;
                    switch (section) {
                      case "accolades":
                        accoladesArray.remove(index);
                        break;
                      case "university_details":
                        universityDetailsArray.remove(index);
                        break;
                      case "campus_stats":
                        campusStatsArray.remove(index);
                        break;
                      case "inside_campus_facilities":
                        facilitiesArray.remove(index);
                        break;
                      case "achievements":
                        achievementsArray.remove(index);
                        break;
                      case "testimonials":
                        testimonialsArray.remove(index);
                        break;
                      case "social":
                        socialLinksArray.remove(index);
                        break;
                      case "campus_reels":
                        reelsArray.remove(index);
                        break;
                      case "nearby_access":
                        nearbyAccessArray.remove(index);
                        break;
                      default:
                        break;
                    }
                    setOverviewDeleteTarget(null);
                  }}
                />
              </div>
            )}

            {/* 3. STUDENT CONDUCT TAB */}
            {activeTab === "student_code_of_conduct" && (
              <Card className="border border-border/80 shadow-md bg-card/60 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Student Code
                    of Conduct
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
                        disabled={isLastItemIncomplete(
                          conductRulesWatch,
                          "rule",
                        )}
                        onClick={() =>
                          conductRulesArray.append({
                            number: conductRulesArray.fields.length + 1,
                            rule: "",
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Rule
                      </Button>
                    </div>

                    {conductRulesArray.fields.length === 0 ? (
                      <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground bg-muted/5">
                        No rules added yet. Click &apos;Add Rule&apos; to create
                        code of conduct rules.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {conductRulesArray.fields.map((field, idx) => (
                          <div
                            key={field.id}
                            className="flex gap-3 items-start border p-3 rounded-lg bg-muted/10"
                          >
                            <div className="font-bold text-sm text-primary bg-primary/10 px-2.5 py-1.5 rounded-md mt-1">
                              #{idx + 1}
                            </div>
                            <div className="flex-1 space-y-1">
                              <Textarea
                                placeholder="Describe this rule details..."
                                className="min-h-[60px]"
                                {...register(
                                  `profileSections.student_code_of_conduct.rules.${idx}.rule`,
                                )}
                              />
                              {(
                                errors.profileSections
                                  ?.student_code_of_conduct as any
                              )?.rules?.[idx]?.rule && (
                                <p className="text-xs text-destructive">
                                  {
                                    (
                                      errors.profileSections
                                        ?.student_code_of_conduct as any
                                    ).rules[idx]?.rule?.message
                                  }
                                </p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-1"
                              onClick={() =>
                                setOtherTabsDeleteTarget({
                                  section: "student_code_of_conduct.rules",
                                  index: idx,
                                })
                              }
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
                    <Play className="h-5 w-5 text-primary" /> Happenings & News
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
                        disabled={isLastItemIncomplete(
                          happeningsWatch,
                          "title",
                        )}
                        onClick={() =>
                          happeningsArray.append({
                            category: "Certification",
                            date: "",
                            title: "",
                            description: "",
                            image: "",
                            link: "",
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Happening
                      </Button>
                    </div>

                    {happeningsArray.fields.length === 0 ? (
                      <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground bg-muted/5">
                        No events configured. Add first happening to highlight
                        campus news.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {happeningsArray.fields.map((field, idx) => (
                          <div
                            key={field.id}
                            className="border p-4 rounded-xl bg-muted/20 space-y-3"
                          >
                            <div className="flex justify-between items-center">
                              <h5 className="font-bold text-sm text-muted-foreground">
                                Happening #{idx + 1}
                              </h5>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive h-8"
                                onClick={() =>
                                  setOtherTabsDeleteTarget({
                                    section: "happenings.happenings",
                                    index: idx,
                                  })
                                }
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
                                {(errors.profileSections?.happenings as any)
                                  ?.happenings?.[idx]?.title && (
                                  <p className="text-xs text-destructive">
                                    {
                                      (
                                        errors.profileSections
                                          ?.happenings as any
                                      ).happenings[idx]?.title?.message
                                    }
                                  </p>
                                )}
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
                                <Label className="text-xs">Image</Label>
                                <ImageUpload
                                  value={happeningsWatch[idx]?.image || ""}
                                  onChange={(url) =>
                                    setValue(
                                      `profileSections.happenings.happenings.${idx}.image`,
                                      url,
                                      { shouldDirty: true },
                                    )
                                  }
                                  context={`happenings/items-${idx}`}
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
                                {(errors.profileSections?.happenings as any)
                                  ?.happenings?.[idx]?.link && (
                                  <p className="text-xs text-destructive">
                                    {
                                      (
                                        errors.profileSections
                                          ?.happenings as any
                                      ).happenings[idx]?.link?.message
                                    }
                                  </p>
                                )}
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
                    <Globe className="h-5 w-5 text-primary" /> Institutions
                    Across the World
                  </CardTitle>
                  <CardDescription>
                    {globalInstitutionsGroup
                      ? "This college is part of an institution group — the institutions below are computed live from that group, not editable here."
                      : "Configure global collaborations, student exchange programs, or dual degree colleges."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {globalInstitutionsGroup ? (
                    <div className="space-y-4">
                      <div className="rounded-lg border bg-primary/5 p-4 space-y-1">
                        <p className="text-sm font-semibold">
                          {globalInstitutionsGroup.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {globalInstitutionsGroup.groupCode}
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Institutions ({globalInstitutionsWatch.length})
                        </Label>
                        {globalInstitutionsWatch.map((inst: any) => (
                          <div
                            key={inst.id}
                            className="flex items-center justify-between rounded-lg border bg-background/40 px-3 py-2 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              {inst.logoUrl ? (
                                <img
                                  src={inst.logoUrl}
                                  alt={inst.name}
                                  className="h-6 w-6 rounded object-cover"
                                />
                              ) : (
                                <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
                                  <Building className="h-3 w-3 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="font-medium leading-none">
                                    {inst.name}
                                  </p>
                                  {inst.selected && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px]"
                                    >
                                      Your College
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                  {[inst.city, inst.state]
                                    .filter(Boolean)
                                    .join(", ") || "—"}
                                  {inst.selected &&
                                    ` · ${inst.departments?.length ?? 0} department(s)`}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
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
                            disabled={isLastItemIncomplete(
                              globalInstitutionsWatch,
                              "name",
                            )}
                            onClick={() =>
                              globalInstitutionsArray.append({
                                name: "",
                                country: "",
                                logo: "",
                              })
                            }
                          >
                            <Plus className="h-4 w-4 mr-2" /> Add Partner
                          </Button>
                        </div>

                        {globalInstitutionsArray.fields.length === 0 ? (
                          <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground bg-muted/5">
                            No global institutions configured. Add a partner to
                            highlight international footprint.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {globalInstitutionsArray.fields.map(
                              (field, idx) => (
                                <div
                                  key={field.id}
                                  className="flex gap-3 items-start border p-3 rounded-lg bg-muted/10"
                                >
                                  <div className="flex-1 space-y-1">
                                    <Input
                                      placeholder="Institution Name"
                                      {...register(
                                        `profileSections.institutions_across_world.institutions.${idx}.name`,
                                      )}
                                    />
                                    {(
                                      errors.profileSections
                                        ?.institutions_across_world as any
                                    )?.institutions?.[idx]?.name && (
                                      <p className="text-xs text-destructive">
                                        {
                                          (
                                            errors.profileSections
                                              ?.institutions_across_world as any
                                          ).institutions[idx]?.name?.message
                                        }
                                      </p>
                                    )}
                                  </div>
                                  <Input
                                    placeholder="Country / Region"
                                    className="flex-1"
                                    {...register(
                                      `profileSections.institutions_across_world.institutions.${idx}.country`,
                                    )}
                                  />
                                  <div className="max-w-[220px]">
                                    <ImageUpload
                                      value={
                                        globalInstitutionsWatch[idx]?.logo || ""
                                      }
                                      onChange={(url) =>
                                        setValue(
                                          `profileSections.institutions_across_world.institutions.${idx}.logo`,
                                          url,
                                          { shouldDirty: true },
                                        )
                                      }
                                      context={`institutions/logos-${idx}`}
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() =>
                                      setOtherTabsDeleteTarget({
                                        section:
                                          "institutions_across_world.institutions",
                                        index: idx,
                                      })
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 6. COMMUTE TAB */}
            {activeTab === "commute" && (
              <Card className="border border-border/80 shadow-md bg-card/60 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" /> Commute &
                    Accessibility
                  </CardTitle>
                  <CardDescription>
                    Configure pickup points, route timings, bus details, and
                    commuter conduct policy.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Routes */}
                  <div className="space-y-4 pt-4 border-t border-border/40">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Routes
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isLastItemIncomplete(
                          commuteRoutesWatch,
                          "route_name",
                        )}
                        onClick={() =>
                          commuteRoutesArray.append(createEmptyCommuteRoute())
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Route
                      </Button>
                    </div>
                    {commuteRoutesArray.fields.length === 0 ? (
                      <p className="text-sm text-muted-foreground border border-dashed rounded-lg p-4">
                        No commute route configured yet.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {commuteRoutesArray.fields.map((field, routeIdx) => (
                          <CommuteRouteFields
                            key={field.id}
                            routeIdx={routeIdx}
                            control={control}
                            register={register}
                            errors={errors}
                            onRemoveRoute={() =>
                              setOtherTabsDeleteTarget({
                                section: "commute.routes",
                                index: routeIdx,
                              })
                            }
                            onRemoveMorningStop={(stopIdx) =>
                              setOtherTabsDeleteTarget({
                                section: "commute.routes.morning_pickup_points",
                                index: stopIdx,
                                routeIndex: routeIdx,
                              })
                            }
                            onRemoveEveningStop={(stopIdx) =>
                              setOtherTabsDeleteTarget({
                                section:
                                  "commute.routes.evening_dropoff_points",
                                index: stopIdx,
                                routeIndex: routeIdx,
                              })
                            }
                            createEmptyCommuteStop={createEmptyCommuteStop}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rules and code of conduct */}
                  <div className="space-y-4 pt-4 border-t border-border/40">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
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
                        disabled={isLastItemIncomplete(
                          commuteRulesWatch,
                          "title",
                        )}
                        onClick={() =>
                          commuteRulesArray.append({
                            title: "",
                            description: "",
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Rule
                      </Button>
                    </div>

                    {commuteRulesArray.fields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="border rounded-lg p-3 bg-muted/10 space-y-2"
                      >
                        <div className="flex gap-2 items-start">
                          <div className="flex-1">
                            <Input
                              placeholder="Rule title"
                              {...register(
                                `profileSections.commute.rules_and_code_of_conduct.rules.${idx}.title`,
                              )}
                            />
                            {(errors.profileSections?.commute as any)
                              ?.rules_and_code_of_conduct?.rules?.[idx]
                              ?.title && (
                              <p className="text-xs text-destructive">
                                {
                                  (errors.profileSections?.commute as any)
                                    .rules_and_code_of_conduct.rules[idx]?.title
                                    ?.message
                                }
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setOtherTabsDeleteTarget({
                                section:
                                  "commute.rules_and_code_of_conduct.rules",
                                index: idx,
                              })
                            }
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
                </CardContent>
              </Card>
            )}

            {/* Shared delete-confirmation dialog for Student Conduct,
                Happenings, Global Presence, and Commute (routes + nested
                stops + rules). */}
            <ConfirmDialog
              open={otherTabsDeleteTarget !== null}
              title="Remove Item"
              description="Remove this item? This cannot be undone until you save."
              confirmLabel="Remove"
              variant="destructive"
              onCancel={() => setOtherTabsDeleteTarget(null)}
              onConfirm={() => {
                if (!otherTabsDeleteTarget) return;
                const { section, index, routeIndex } = otherTabsDeleteTarget;
                switch (section) {
                  case "student_code_of_conduct.rules":
                    conductRulesArray.remove(index);
                    break;
                  case "happenings.happenings":
                    happeningsArray.remove(index);
                    break;
                  case "institutions_across_world.institutions":
                    globalInstitutionsArray.remove(index);
                    break;
                  case "commute.routes":
                    commuteRoutesArray.remove(index);
                    break;
                  case "commute.rules_and_code_of_conduct.rules":
                    commuteRulesArray.remove(index);
                    break;
                  case "commute.routes.morning_pickup_points":
                  case "commute.routes.evening_dropoff_points": {
                    if (routeIndex === undefined) break;
                    const fieldName =
                      section === "commute.routes.morning_pickup_points"
                        ? "morning_pickup_points"
                        : "evening_dropoff_points";
                    const currentRoutes =
                      getValues("profileSections.commute.routes") || [];
                    const next = [...currentRoutes];
                    const currentStops = next[routeIndex]?.[fieldName] || [];
                    next[routeIndex] = {
                      ...next[routeIndex],
                      [fieldName]: currentStops.filter(
                        (_: any, i: number) => i !== index,
                      ),
                    };
                    setValue("profileSections.commute.routes", next);
                    break;
                  }
                  default:
                    break;
                }
                setOtherTabsDeleteTarget(null);
              }}
            />

            {activeTab === "gallery" && <GalleryTab />}

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
                    className="font-semibold shadow-md"
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

// Collapsible section card used by the College Overview tab. Six of these
// replace the single giant card that used to hold all sub-blocks.
function OverviewCard({
  id,
  icon: Icon,
  title,
  description,
  badge,
  open,
  onToggle,
  children,
}: {
  id: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
  open: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <Card className="border border-border/80 shadow-md bg-card/60 backdrop-blur-md">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full text-left"
        aria-expanded={open}
      >
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <CardTitle className="text-lg font-bold">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {badge ? (
              <Badge variant="secondary" className="font-medium">
                {badge}
              </Badge>
            ) : null}
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>
        </CardHeader>
      </button>
      {open && <CardContent className="space-y-8 pt-0">{children}</CardContent>}
    </Card>
  );
}

// Dashed-border empty state shown where an "Add" button would otherwise
// sit, for arrays that currently have zero rows.
function OverviewEmptyState({
  icon: Icon,
  message,
}: {
  icon: ComponentType<{ className?: string }>;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 py-8 text-center">
      <Icon className="h-6 w-6 text-muted-foreground/40" />
      <span className="text-xs text-muted-foreground max-w-xs">{message}</span>
    </div>
  );
}

// One testimonial's fields, incl. the role_lines nested array editor
// (replaces the old newline-split-textarea hack with a real repeatable
// list of small text inputs backed by its own useFieldArray).
function TestimonialFields({
  idx,
  register,
  control,
  setValue,
  watchValue,
  errors,
  onRemove,
}: {
  idx: number;
  register: any;
  control: any;
  setValue: any;
  watchValue: any;
  errors: any;
  onRemove: () => void;
}) {
  const roleLinesArray = useFieldArray({
    control,
    name: `profileSections.college_overview.testimonials.${idx}.role_lines`,
  });

  return (
    <div className="border p-4 rounded-xl bg-muted/10 space-y-3 relative group">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Testimonial #{idx + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive h-8 px-2 hover:bg-destructive/10"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Quote</Label>
          <Textarea
            placeholder="What they said about the college..."
            rows={4}
            {...register(
              `profileSections.college_overview.testimonials.${idx}.quote`,
            )}
          />
          {(errors?.profileSections?.college_overview as any)?.testimonials?.[
            idx
          ]?.quote && (
            <p className="text-xs text-destructive">
              {
                (errors?.profileSections?.college_overview as any).testimonials[
                  idx
                ]?.quote?.message
              }
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Name</Label>
          <Input
            placeholder="Prof. E. Balagurusamy"
            className="h-9"
            {...register(
              `profileSections.college_overview.testimonials.${idx}.name`,
            )}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Role / Title lines</Label>
          <div className="space-y-2">
            {roleLinesArray.fields.map((lineField, lineIdx) => (
              <div key={lineField.id} className="flex gap-2 items-center">
                <Input
                  placeholder="Former VC, Anna University"
                  className="h-8 text-sm flex-1"
                  {...register(
                    `profileSections.college_overview.testimonials.${idx}.role_lines.${lineIdx}`,
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => roleLinesArray.remove(lineIdx)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => roleLinesArray.append("")}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Line
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Photo</Label>
          <ImageUpload
            value={watchValue?.image || ""}
            onChange={(url) =>
              setValue(
                `profileSections.college_overview.testimonials.${idx}.image`,
                url,
                { shouldDirty: true },
              )
            }
            context={`college-overview/testimonials-${idx}`}
          />
        </div>
      </div>
    </div>
  );
}

// One category group inside "Nearby Establishments" — has its own nested
// items[] array, so it needs its own useFieldArray scoped to this row.
function NearbyAccessGroup({
  catIdx,
  control,
  register,
  onRemoveGroup,
}: {
  catIdx: number;
  control: any;
  register: any;
  onRemoveGroup: () => void;
}) {
  const itemsArray = useFieldArray({
    control,
    name: `profileSections.college_overview.nearby_access.${catIdx}.items`,
  });

  return (
    <div className="border p-4 rounded-lg bg-muted/10 space-y-3">
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
            onClick={() => itemsArray.append({ name: "", distance: "" })}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Item
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemoveGroup}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {itemsArray.fields.length === 0 && (
          <p className="pl-4 text-xs text-muted-foreground">
            No items in this category yet.
          </p>
        )}
        {itemsArray.fields.map((itemField, itemIdx) => (
          <div key={itemField.id} className="flex gap-2 items-center pl-4">
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
              onClick={() => itemsArray.remove(itemIdx)}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// One commute route, rendered by the Commute tab's outer `useFieldArray`.
// Mirrors `NearbyAccessGroup`'s pattern: this sub-component owns its own
// nested `useFieldArray`s (morning/evening stop lists) scoped to this route's
// index in the outer array.
function CommuteRouteFields({
  routeIdx,
  control,
  register,
  errors,
  onRemoveRoute,
  onRemoveMorningStop,
  onRemoveEveningStop,
  createEmptyCommuteStop,
}: {
  routeIdx: number;
  control: any;
  register: any;
  errors: any;
  onRemoveRoute: () => void;
  onRemoveMorningStop: (stopIdx: number) => void;
  onRemoveEveningStop: (stopIdx: number) => void;
  createEmptyCommuteStop: () => {
    point: string;
    landmark: string;
    time: string;
  };
}) {
  const morningStopsArray = useFieldArray({
    control,
    name: `profileSections.commute.routes.${routeIdx}.morning_pickup_points`,
  });
  const eveningStopsArray = useFieldArray({
    control,
    name: `profileSections.commute.routes.${routeIdx}.evening_dropoff_points`,
  });
  const routeErrors = errors?.profileSections?.commute?.routes?.[routeIdx];
  const morningStopsWatch: any[] =
    useWatch({
      control,
      name: `profileSections.commute.routes.${routeIdx}.morning_pickup_points`,
    }) || [];
  const eveningStopsWatch: any[] =
    useWatch({
      control,
      name: `profileSections.commute.routes.${routeIdx}.evening_dropoff_points`,
    }) || [];
  const isMorningAddDisabled =
    morningStopsWatch.length > 0 &&
    !String(
      morningStopsWatch[morningStopsWatch.length - 1]?.point ?? "",
    ).trim();
  const isEveningAddDisabled =
    eveningStopsWatch.length > 0 &&
    !String(
      eveningStopsWatch[eveningStopsWatch.length - 1]?.point ?? "",
    ).trim();

  return (
    <div className="border rounded-xl p-4 space-y-4 bg-muted/15">
      <div className="flex items-center justify-between gap-2">
        <h5 className="font-semibold text-muted-foreground">
          Route #{routeIdx + 1}
        </h5>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={onRemoveRoute}
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
          {routeErrors?.route_name && (
            <p className="text-xs text-destructive">
              {routeErrors.route_name.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Via</Label>
          <Input
            placeholder="Via BTM Layout, Madivala"
            {...register(`profileSections.commute.routes.${routeIdx}.via`)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Status</Label>
          <Controller
            name={`profileSections.commute.routes.${routeIdx}.status`}
            control={control}
            render={({ field: statusField }) => (
              <Select
                value={statusField.value || "UNVERIFIED"}
                onValueChange={(v) => statusField.onChange(v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VERIFIED">VERIFIED</SelectItem>
                  <SelectItem value="UNVERIFIED">UNVERIFIED</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Morning Timing Window</Label>
          <Input
            placeholder="6:45 AM - 8:10 AM"
            {...register(
              `profileSections.commute.routes.${routeIdx}.timings.0.time`,
            )}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Evening Timing Window</Label>
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
          <Label className="text-xs">Transport Fee Amount</Label>
          <Input
            placeholder="₹25,000 / Year"
            {...register(
              `profileSections.commute.routes.${routeIdx}.transport_fee.amount`,
            )}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Payment Structure</Label>
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
          <Label className="text-xs">Bus Registration</Label>
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
            )}
          />
          {routeErrors?.bus_information?.seats && (
            <p className="text-xs text-destructive">
              {routeErrors.bus_information.seats.message}
            </p>
          )}
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
          <h6 className="text-xs font-bold uppercase text-muted-foreground">
            Morning Pickup Points
          </h6>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isMorningAddDisabled}
            onClick={() => morningStopsArray.append(createEmptyCommuteStop())}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Morning Stop
          </Button>
        </div>
        {morningStopsArray.fields.map((stopField, stopIdx) => (
          <div key={stopField.id} className="grid gap-2 md:grid-cols-3">
            <div>
              <Input
                placeholder="Point"
                {...register(
                  `profileSections.commute.routes.${routeIdx}.morning_pickup_points.${stopIdx}.point`,
                )}
              />
              {routeErrors?.morning_pickup_points?.[stopIdx]?.point && (
                <p className="text-xs text-destructive">
                  {routeErrors.morning_pickup_points[stopIdx]?.point?.message}
                </p>
              )}
            </div>
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
                onClick={() => onRemoveMorningStop(stopIdx)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-2 border-t border-border/40">
        <div className="flex items-center justify-between">
          <h6 className="text-xs font-bold uppercase text-muted-foreground">
            Evening Dropoff Points
          </h6>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isEveningAddDisabled}
            onClick={() => eveningStopsArray.append(createEmptyCommuteStop())}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Evening Stop
          </Button>
        </div>
        {eveningStopsArray.fields.map((stopField, stopIdx) => (
          <div key={stopField.id} className="grid gap-2 md:grid-cols-3">
            <div>
              <Input
                placeholder="Point"
                {...register(
                  `profileSections.commute.routes.${routeIdx}.evening_dropoff_points.${stopIdx}.point`,
                )}
              />
              {routeErrors?.evening_dropoff_points?.[stopIdx]?.point && (
                <p className="text-xs text-destructive">
                  {routeErrors.evening_dropoff_points[stopIdx]?.point?.message}
                </p>
              )}
            </div>
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
                onClick={() => onRemoveEveningStop(stopIdx)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryTab() {
  const { data: galleryItems, isLoading } = useCollegeGallery();
  const { mutate: createItem, isPending: isUploading } =
    useCreateCollegeGalleryItem();
  const { mutate: deleteItem, isPending: isDeleting } =
    useDeleteCollegeGalleryItem();
  const [deleteTarget, setDeleteTarget] = useState<PublicGalleryItem | null>(
    null,
  );

  async function handleUpload(file: File | null) {
    if (!file) return;
    try {
      const url = await uploadCollegeAdminFile(
        file,
        "college-overview/gallery",
      );
      createItem(
        { mediaType: "image", url },
        {
          onSuccess: () => toast.success("Gallery image added"),
        },
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteItem(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Gallery image removed");
        setDeleteTarget(null);
      },
    });
  }

  return (
    <Card className="border border-border/80 shadow-md bg-card/60 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" /> Campus Gallery
        </CardTitle>
        <CardDescription>
          Photos shown in the Campus Gallery section on your public landing
          page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : galleryItems && galleryItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
              >
                <img
                  src={item.url}
                  alt={item.caption ?? "Gallery photo"}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove gallery photo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/20 py-10">
            <ImagePlus className="h-8 w-8 text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground">
              No gallery images yet
            </span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="font-semibold">Add Photo</Label>
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isUploading}
            onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
          />
          {isUploading ? (
            <p className="text-xs text-muted-foreground">Uploading…</p>
          ) : null}
        </div>
      </CardContent>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove Gallery Photo"
        description={
          deleteTarget
            ? "Remove this photo from your college gallery? This cannot be undone."
            : ""
        }
        confirmLabel="Remove"
        variant="destructive"
        loading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </Card>
  );
}
