"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Plus, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store";
import { getPortalPath, getCollegeSlugFromPath } from "@/lib/portal-path";
import { uploadCollegeAdminFile } from "@/lib/services/colleges.service";

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
import { ImageUpload } from "@/components/ui/image-upload";

import {
  useCollegeHostels,
  useUpdateCollegeHostel,
  useCreateHostelRoomType,
  useDeleteHostelRoomType,
  useCreateHostelMessPlan,
  useDeleteHostelMessPlan,
  useCreateHostelAddonService,
  useDeleteHostelAddonService,
} from "@/hooks/use-facilities";
import { EnrolledStudentsTab } from "@/components/hostel/enrolled-students-tab";

const ADDON_SERVICE_TYPES = ["laundry", "gym", "parking", "other"] as const;
const ADDON_PLAN_PERIODS = ["monthly", "quarterly", "annual"] as const;
const ADDON_PLAN_PERIOD_LABELS: Record<
  (typeof ADDON_PLAN_PERIODS)[number],
  string
> = {
  monthly: "Per Month",
  quarterly: "Per Quarter",
  annual: "Per Year",
};
const MAX_ROOM_PHOTOS = 4;

export default function HostelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hostelId = Array.isArray(params.id) ? params.id[0] : params.id;
  const collegeSlug =
    typeof window === "undefined"
      ? user?.collegeSlug || null
      : getCollegeSlugFromPath(window.location.pathname, window.location.host);

  const { data: hostels = [], isLoading } = useCollegeHostels();
  const hostel = hostels.find((h) => h.id === hostelId);

  const [activeTab, setActiveTab] = useState<"overview" | "students">(
    "overview",
  );

  const { mutate: updateHostel, isPending: isSavingProfile } =
    useUpdateCollegeHostel();

  const [hostelType, setHostelType] = useState<"boys" | "girls" | "co-ed">(
    "co-ed",
  );
  const [isOnCampus, setIsOnCampus] = useState(true);
  const [distanceFromCampus, setDistanceFromCampus] = useState("");
  const [description, setDescription] = useState("");
  const [totalBeds, setTotalBeds] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [badge, setBadge] = useState("");
  const [safetyTier, setSafetyTier] = useState("");
  const [tags, setTags] = useState<{ label: string; color?: string }[]>([]);
  const [wardenName, setWardenName] = useState("");
  const [wardenPhone, setWardenPhone] = useState("");
  const [wardenWhatsapp, setWardenWhatsapp] = useState("");
  const [wardenEmail, setWardenEmail] = useState("");
  const [wardenPhoto, setWardenPhoto] = useState("");
  const [wardenDesignation, setWardenDesignation] = useState("");
  const [safetyFeatures, setSafetyFeatures] = useState<{ label: string }[]>([]);
  const [amenities, setAmenities] = useState<{ name: string; icon?: string }[]>(
    [],
  );
  const [rules, setRules] = useState<{ title: string; description: string }[]>(
    [],
  );
  const [address, setAddress] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [mapThumbnail, setMapThumbnail] = useState("");
  const [transportDescription, setTransportDescription] = useState("");
  const [busStopNote, setBusStopNote] = useState("");
  const [nearbyEssentials, setNearbyEssentials] = useState<
    { type: string; name: string; distance: string }[]
  >([]);
  const [utilities, setUtilities] = useState<
    { category: string; provider: string; notes?: string }[]
  >([]);
  const [transit, setTransit] = useState<
    { route: string; stop?: string; timing?: string }[]
  >([]);

  useEffect(() => {
    if (!hostel) return;
    setHostelType(hostel.hostelType || "co-ed");
    setIsOnCampus(hostel.isOnCampus ?? true);
    setDistanceFromCampus(hostel.distanceFromCampus || "");
    setDescription(hostel.description || "");
    setTotalBeds(hostel.totalBeds ? String(hostel.totalBeds) : "");
    setCoverImageUrl(hostel.coverImageUrl || "");
    setBadge(hostel.badge || "");
    setSafetyTier(hostel.safetyTier || "");
    setTags(hostel.tags || []);
    setWardenName(hostel.wardenInfo?.name || "");
    setWardenPhone(hostel.wardenInfo?.phone || "");
    setWardenWhatsapp(hostel.wardenInfo?.whatsapp || "");
    setWardenEmail(hostel.wardenInfo?.email || "");
    setWardenPhoto(hostel.wardenInfo?.photo || "");
    setWardenDesignation(hostel.wardenInfo?.designation || "");
    setSafetyFeatures(hostel.wardenInfo?.safetyFeatures || []);
    setAmenities(hostel.amenities || []);
    setRules(hostel.rules || []);
    setAddress(hostel.locationInfo?.address || "");
    setAddressLine2(hostel.locationInfo?.addressLine2 || "");
    setLatitude(
      hostel.locationInfo?.latitude != null
        ? String(hostel.locationInfo.latitude)
        : "",
    );
    setLongitude(
      hostel.locationInfo?.longitude != null
        ? String(hostel.locationInfo.longitude)
        : "",
    );
    setMapLink(hostel.locationInfo?.mapLink || "");
    setMapThumbnail(hostel.locationInfo?.map?.thumbnail || "");
    setTransportDescription(
      hostel.locationInfo?.collegeTransport?.description || "",
    );
    setBusStopNote(hostel.locationInfo?.collegeTransport?.busStopNote || "");
    setNearbyEssentials(hostel.locationInfo?.nearbyEssentials || []);
    setUtilities(hostel.locationInfo?.utilities || []);
    setTransit(hostel.locationInfo?.transit || []);
  }, [hostel?.id]);

  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagColor, setNewTagColor] = useState("");
  const [newSafetyFeature, setNewSafetyFeature] = useState("");
  const [newAmenityName, setNewAmenityName] = useState("");
  const [newRuleTitle, setNewRuleTitle] = useState("");
  const [newRuleDesc, setNewRuleDesc] = useState("");
  const [newEssentialType, setNewEssentialType] = useState("");
  const [newEssentialName, setNewEssentialName] = useState("");
  const [newEssentialDistance, setNewEssentialDistance] = useState("");
  const [newUtilityCategory, setNewUtilityCategory] = useState("");
  const [newUtilityProvider, setNewUtilityProvider] = useState("");
  const [newUtilityNotes, setNewUtilityNotes] = useState("");
  const [newTransitRoute, setNewTransitRoute] = useState("");
  const [newTransitStop, setNewTransitStop] = useState("");
  const [newTransitTiming, setNewTransitTiming] = useState("");

  const { mutate: createRoomType, isPending: isAddingRoomType } =
    useCreateHostelRoomType();
  const { mutate: deleteRoomType } = useDeleteHostelRoomType();
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [roomBeds, setRoomBeds] = useState("");
  const [roomAnnualPrice, setRoomAnnualPrice] = useState("");
  const [roomMonthlyPrice, setRoomMonthlyPrice] = useState("");
  const [roomAdmissionFee, setRoomAdmissionFee] = useState("");
  const [roomDeposit, setRoomDeposit] = useState("");
  const [roomPhotos, setRoomPhotos] = useState<string[]>(
    Array(MAX_ROOM_PHOTOS).fill(""),
  );
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const { mutate: createMessPlan, isPending: isAddingMessPlan } =
    useCreateHostelMessPlan();
  const { mutate: deleteMessPlan } = useDeleteHostelMessPlan();
  const [mealName, setMealName] = useState("");
  const [mealPrice, setMealPrice] = useState("");
  const [mealIncluded, setMealIncluded] = useState("");
  const [mealDuration, setMealDuration] = useState("1 Month");
  const [mealDietaryOptions, setMealDietaryOptions] = useState("");
  const [mealCompulsory, setMealCompulsory] = useState(false);

  const { mutate: createAddonService, isPending: isAddingAddon } =
    useCreateHostelAddonService();
  const { mutate: deleteAddonService } = useDeleteHostelAddonService();
  const [addonType, setAddonType] = useState<string>("laundry");
  const [addonName, setAddonName] = useState("");
  const [addonPlanLabel, setAddonPlanLabel] = useState("");
  const [addonPlanPrice, setAddonPlanPrice] = useState("");
  const [addonPlanPeriod, setAddonPlanPeriod] =
    useState<(typeof ADDON_PLAN_PERIODS)[number]>("monthly");
  const [addonNotes, setAddonNotes] = useState("");
  const [addonPlanFeatureTags, setAddonPlanFeatureTags] = useState("");

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Hostel not found.
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => router.push(getPortalPath(collegeSlug, "/hostels"))}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hostels
          </Button>
        </div>
      </div>
    );
  }

  const handleImageUpload = async (
    file: File | null,
    fieldKey: string,
    context: string,
    onSuccess: (url: string) => void,
  ) => {
    if (!file) return;
    try {
      setUploadingField(fieldKey);
      const permanentUrl = await uploadCollegeAdminFile(file, context);
      onSuccess(permanentUrl);
      toast.success("Image uploaded");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploadingField(null);
    }
  };

  const saveProfile = () => {
    updateHostel(
      {
        id: hostel.id,
        data: {
          hostelType,
          isOnCampus,
          distanceFromCampus: isOnCampus ? null : distanceFromCampus || null,
          description: description || null,
          totalBeds: totalBeds ? Number(totalBeds) : null,
          coverImageUrl: coverImageUrl || null,
          badge: badge || null,
          safetyTier: safetyTier || null,
          tags,
          wardenInfo: {
            name: wardenName || undefined,
            phone: wardenPhone || undefined,
            whatsapp: wardenWhatsapp || undefined,
            email: wardenEmail || undefined,
            photo: wardenPhoto || undefined,
            designation: wardenDesignation || undefined,
            safetyFeatures,
          },
          amenities,
          rules,
          locationInfo: {
            address: address || undefined,
            addressLine2: addressLine2 || undefined,
            latitude: latitude ? Number(latitude) : undefined,
            longitude: longitude ? Number(longitude) : undefined,
            mapLink: mapLink || undefined,
            map: mapThumbnail ? { thumbnail: mapThumbnail } : undefined,
            collegeTransport:
              transportDescription || busStopNote
                ? {
                    description: transportDescription || undefined,
                    busStopNote: busStopNote || undefined,
                  }
                : undefined,
            nearbyEssentials,
            utilities: utilities.length ? utilities : undefined,
            transit: transit.length ? transit : undefined,
          },
        },
      },
      {
        onSuccess: () => toast.success("Hostel profile updated"),
      },
    );
  };

  const addTag = () => {
    if (!newTagLabel.trim()) return;
    setTags([
      ...tags,
      { label: newTagLabel.trim(), color: newTagColor.trim() || "blue" },
    ]);
    setNewTagLabel("");
    setNewTagColor("");
  };

  const addSafetyFeature = () => {
    if (!newSafetyFeature.trim()) return;
    setSafetyFeatures([...safetyFeatures, { label: newSafetyFeature.trim() }]);
    setNewSafetyFeature("");
  };

  const addAmenity = () => {
    if (!newAmenityName.trim()) return;
    setAmenities([...amenities, { name: newAmenityName.trim() }]);
    setNewAmenityName("");
  };

  const addRule = () => {
    if (!newRuleTitle.trim() || !newRuleDesc.trim()) {
      toast.error("Please fill in rule title and description");
      return;
    }
    setRules([
      ...rules,
      { title: newRuleTitle.trim(), description: newRuleDesc.trim() },
    ]);
    setNewRuleTitle("");
    setNewRuleDesc("");
  };

  const addNearbyEssential = () => {
    if (!newEssentialType.trim() || !newEssentialName.trim()) {
      toast.error("Please fill in essential type and name");
      return;
    }
    setNearbyEssentials([
      ...nearbyEssentials,
      {
        type: newEssentialType.trim(),
        name: newEssentialName.trim(),
        distance: newEssentialDistance.trim(),
      },
    ]);
    setNewEssentialType("");
    setNewEssentialName("");
    setNewEssentialDistance("");
  };

  const addUtility = () => {
    if (!newUtilityCategory.trim() || !newUtilityProvider.trim()) {
      toast.error("Please fill in utility category and provider");
      return;
    }
    setUtilities([
      ...utilities,
      {
        category: newUtilityCategory.trim(),
        provider: newUtilityProvider.trim(),
        notes: newUtilityNotes.trim() || undefined,
      },
    ]);
    setNewUtilityCategory("");
    setNewUtilityProvider("");
    setNewUtilityNotes("");
  };

  const addTransitRoute = () => {
    if (!newTransitRoute.trim()) {
      toast.error("Please fill in route name");
      return;
    }
    setTransit([
      ...transit,
      {
        route: newTransitRoute.trim(),
        stop: newTransitStop.trim() || undefined,
        timing: newTransitTiming.trim() || undefined,
      },
    ]);
    setNewTransitRoute("");
    setNewTransitStop("");
    setNewTransitTiming("");
  };

  const addRoomType = () => {
    if (!roomName.trim() || !roomBeds.trim()) {
      toast.error("Please fill in room category name and beds capacity");
      return;
    }
    createRoomType(
      {
        hostelId: hostel.id,
        data: {
          name: roomName.trim(),
          description: roomDescription.trim() || undefined,
          totalBeds: Number(roomBeds),
          annualPlanPrice: roomAnnualPrice ? Number(roomAnnualPrice) : 0,
          monthlyPlanPrice: roomMonthlyPrice ? Number(roomMonthlyPrice) : 0,
          admissionFee: roomAdmissionFee ? Number(roomAdmissionFee) : 0,
          securityDeposit: roomDeposit ? Number(roomDeposit) : 0,
          photos: roomPhotos.filter(Boolean),
        },
      },
      {
        onSuccess: () => {
          toast.success("Room type added");
          setRoomName("");
          setRoomDescription("");
          setRoomBeds("");
          setRoomAnnualPrice("");
          setRoomMonthlyPrice("");
          setRoomAdmissionFee("");
          setRoomDeposit("");
          setRoomPhotos(Array(MAX_ROOM_PHOTOS).fill(""));
        },
      },
    );
  };

  const addMessPlan = () => {
    if (!mealName.trim() || !mealPrice.trim()) {
      toast.error("Please fill in mess plan name and monthly price");
      return;
    }
    createMessPlan(
      {
        hostelId: hostel.id,
        data: {
          name: mealName.trim(),
          priceMonthly: Number(mealPrice),
          mealsIncluded: mealIncluded
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          duration: mealDuration.trim() || "1 Month",
          dietaryOptions: mealDietaryOptions
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          isCompulsory: mealCompulsory,
        },
      },
      {
        onSuccess: () => {
          toast.success("Mess plan added");
          setMealName("");
          setMealPrice("");
          setMealIncluded("");
          setMealDuration("1 Month");
          setMealDietaryOptions("");
          setMealCompulsory(false);
        },
      },
    );
  };

  const addAddonService = () => {
    if (!addonName.trim() || !addonPlanLabel.trim() || !addonPlanPrice.trim()) {
      toast.error("Please fill in service name and at least one plan");
      return;
    }
    createAddonService(
      {
        hostelId: hostel.id,
        data: {
          serviceType: addonType,
          name: addonName.trim(),
          plans: [
            {
              label: addonPlanLabel.trim(),
              price: Number(addonPlanPrice),
              period: addonPlanPeriod,
              feature_tags: addonPlanFeatureTags
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            },
          ],
          notes: addonNotes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Addon service added");
          setAddonName("");
          setAddonPlanLabel("");
          setAddonPlanPrice("");
          setAddonPlanPeriod("monthly");
          setAddonNotes("");
          setAddonPlanFeatureTags("");
        },
      },
    );
  };

  const addonsByType = ADDON_SERVICE_TYPES.map((type) => ({
    type,
    items: (hostel.addonServices || []).filter((a) => a.serviceType === type),
  }));

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(getPortalPath(collegeSlug, "/hostels"))}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{hostel.name}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-500" />
            {Number(hostel.avgRating ?? 0).toFixed(1)} rating &middot;{" "}
            {hostel.reviewCount ?? 0} reviews
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === "overview"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Hostel Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === "students"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Enrolled Students
        </button>
      </div>

      {activeTab === "students" && (
        <EnrolledStudentsTab
          hostelId={hostelId as string}
          roomTypes={hostel.roomTypes}
        />
      )}

      {activeTab === "overview" && (
        <>
          <Card className="border border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Hostel Profile
              </CardTitle>
              <CardDescription>
                Description, capacity, warden contact, amenities, rules, and
                location.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Target Allocation</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                    value={hostelType}
                    onChange={(e) =>
                      setHostelType(
                        e.target.value as "boys" | "girls" | "co-ed",
                      )
                    }
                  >
                    <option value="co-ed">Co-Educational</option>
                    <option value="boys">Boys Only</option>
                    <option value="girls">Girls Only</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={isOnCampus}
                      onChange={(e) => setIsOnCampus(e.target.checked)}
                    />
                    <Label className="!mb-0">Located On-Campus</Label>
                  </label>
                  {!isOnCampus && (
                    <Input
                      placeholder="Distance from campus (km), e.g. 1.8"
                      value={distanceFromCampus}
                      onChange={(e) => setDistanceFromCampus(e.target.value)}
                    />
                  )}
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Modern rooms with laundry facility..."
                  />
                </div>
                <div className="space-y-1">
                  <Label>Total Beds</Label>
                  <Input
                    type="number"
                    value={totalBeds}
                    onChange={(e) => setTotalBeds(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Cover Image</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={uploadingField === "coverImageUrl"}
                      onChange={(e) =>
                        handleImageUpload(
                          e.target.files?.[0] ?? null,
                          "coverImageUrl",
                          `hostels/${hostel.id}/cover`,
                          setCoverImageUrl,
                        )
                      }
                    />
                    {coverImageUrl && (
                      <img
                        src={coverImageUrl}
                        alt="Cover preview"
                        className="h-10 w-16 rounded-md border object-cover"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Verified Badge Text</Label>
                  <Input
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Safe & Secure - Premium PG Partnered"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Safety Tier</Label>
                  <Input
                    value={safetyTier}
                    onChange={(e) => setSafetyTier(e.target.value)}
                    placeholder="Premium"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label className="font-semibold">Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1 text-xs bg-muted/40 border rounded-full px-3 py-1"
                    >
                      {t.label}
                      <button
                        type="button"
                        onClick={() =>
                          setTags(tags.filter((_, i) => i !== idx))
                        }
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Label (e.g. On-Campus)"
                    value={newTagLabel}
                    onChange={(e) => setNewTagLabel(e.target.value)}
                  />
                  <Input
                    placeholder="Color (e.g. blue)"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label className="font-semibold">Warden Info</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="Name"
                    value={wardenName}
                    onChange={(e) => setWardenName(e.target.value)}
                  />
                  <Input
                    placeholder="Designation (e.g. Chief Warden)"
                    value={wardenDesignation}
                    onChange={(e) => setWardenDesignation(e.target.value)}
                  />
                  <Input
                    placeholder="Phone"
                    value={wardenPhone}
                    onChange={(e) => setWardenPhone(e.target.value)}
                  />
                  <Input
                    placeholder="WhatsApp"
                    value={wardenWhatsapp}
                    onChange={(e) => setWardenWhatsapp(e.target.value)}
                  />
                  <Input
                    placeholder="Email"
                    value={wardenEmail}
                    onChange={(e) => setWardenEmail(e.target.value)}
                  />
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={uploadingField === "wardenPhoto"}
                      onChange={(e) =>
                        handleImageUpload(
                          e.target.files?.[0] ?? null,
                          "wardenPhoto",
                          `hostels/${hostel.id}/warden-photo`,
                          setWardenPhoto,
                        )
                      }
                    />
                    {wardenPhoto && (
                      <img
                        src={wardenPhoto}
                        alt="Warden preview"
                        className="h-10 w-10 rounded-full border object-cover"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <Label className="text-xs text-muted-foreground">
                    Safety Features
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {safetyFeatures.map((f, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1 text-xs bg-muted/40 border rounded-full px-3 py-1"
                      >
                        {f.label}
                        <button
                          type="button"
                          onClick={() =>
                            setSafetyFeatures(
                              safetyFeatures.filter((_, i) => i !== idx),
                            )
                          }
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Feature (e.g. CCTV Coverage)"
                      value={newSafetyFeature}
                      onChange={(e) => setNewSafetyFeature(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSafetyFeature}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label className="font-semibold">Amenities</Label>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1 text-xs bg-muted/40 border rounded-full px-3 py-1"
                    >
                      {a.name}
                      <button
                        type="button"
                        onClick={() =>
                          setAmenities(amenities.filter((_, i) => i !== idx))
                        }
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Amenity name (e.g. High Speed Wi-Fi)"
                    value={newAmenityName}
                    onChange={(e) => setNewAmenityName(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={addAmenity}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label className="font-semibold">Rules</Label>
                <div className="space-y-2">
                  {rules.map((r, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-2 border p-2.5 rounded-lg bg-muted/10 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold break-words">{r.title}</p>
                        <p className="text-muted-foreground break-words">
                          {r.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="shrink-0"
                        onClick={() =>
                          setRules(rules.filter((_, i) => i !== idx))
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="Rule title (e.g. Curfew Time)"
                    value={newRuleTitle}
                    onChange={(e) => setNewRuleTitle(e.target.value)}
                  />
                  <Input
                    placeholder="Description"
                    value={newRuleDesc}
                    onChange={(e) => setNewRuleDesc(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRule}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Rule
                </Button>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label className="font-semibold">Location</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="Address line 1"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <Input
                    placeholder="Address line 2"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                  <Input
                    placeholder="Map link (https://maps.google.com/?q=...)"
                    value={mapLink}
                    onChange={(e) => setMapLink(e.target.value)}
                  />
                  <ImageUpload
                    value={mapThumbnail}
                    onChange={setMapThumbnail}
                    context={`hostels/${hostel.id}/map-thumbnail`}
                  />
                  <Input
                    placeholder="College transport description"
                    value={transportDescription}
                    onChange={(e) => setTransportDescription(e.target.value)}
                  />
                  <Input
                    placeholder="Bus stop note (e.g. 50m from gate)"
                    value={busStopNote}
                    onChange={(e) => setBusStopNote(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  {nearbyEssentials.map((ne, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 border p-2 rounded-lg bg-muted/10 text-xs"
                    >
                      <span className="min-w-0 flex-1 break-words">
                        {ne.type}: {ne.name} ({ne.distance})
                      </span>
                      <button
                        type="button"
                        className="shrink-0"
                        onClick={() =>
                          setNearbyEssentials(
                            nearbyEssentials.filter((_, i) => i !== idx),
                          )
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input
                    placeholder="Type (e.g. Hospital)"
                    value={newEssentialType}
                    onChange={(e) => setNewEssentialType(e.target.value)}
                  />
                  <Input
                    placeholder="Name"
                    value={newEssentialName}
                    onChange={(e) => setNewEssentialName(e.target.value)}
                  />
                  <Input
                    placeholder="Distance (e.g. 3.0 km)"
                    value={newEssentialDistance}
                    onChange={(e) => setNewEssentialDistance(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNearbyEssential}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Nearby Essential
                </Button>
              </div>

              {/* Utilities */}
              <div className="space-y-2 border-t pt-4 border-border/40">
                <Label className="text-sm font-semibold">Utilities</Label>
                {utilities.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No utilities added yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {utilities.map((u, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 border p-3 rounded-lg bg-muted/10"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold break-words">
                            {u.category}
                          </p>
                          <p className="text-xs text-muted-foreground break-words">
                            {u.provider}
                            {u.notes ? ` — ${u.notes}` : ""}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() =>
                            setUtilities(utilities.filter((_, i) => i !== idx))
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid gap-2 sm:grid-cols-3 p-3 border rounded-lg bg-muted/5">
                  <Input
                    placeholder="Category (e.g. Electricity)"
                    value={newUtilityCategory}
                    onChange={(e) => setNewUtilityCategory(e.target.value)}
                  />
                  <Input
                    placeholder="Provider (e.g. MSEB)"
                    value={newUtilityProvider}
                    onChange={(e) => setNewUtilityProvider(e.target.value)}
                  />
                  <Input
                    placeholder="Notes (optional)"
                    value={newUtilityNotes}
                    onChange={(e) => setNewUtilityNotes(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="sm:col-span-3"
                    onClick={addUtility}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Utility
                  </Button>
                </div>
              </div>

              {/* Transit */}
              <div className="space-y-2 border-t pt-4 border-border/40">
                <Label className="text-sm font-semibold">Transit Routes</Label>
                {transit.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No transit routes added yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {transit.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 border p-3 rounded-lg bg-muted/10"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold break-words">
                            {t.route}
                          </p>
                          <p className="text-xs text-muted-foreground break-words">
                            {[t.stop, t.timing].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() =>
                            setTransit(transit.filter((_, i) => i !== idx))
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid gap-2 sm:grid-cols-3 p-3 border rounded-lg bg-muted/5">
                  <Input
                    placeholder="Route (e.g. Bus 47 to Campus)"
                    value={newTransitRoute}
                    onChange={(e) => setNewTransitRoute(e.target.value)}
                  />
                  <Input
                    placeholder="Stop (e.g. Gate 2)"
                    value={newTransitStop}
                    onChange={(e) => setNewTransitStop(e.target.value)}
                  />
                  <Input
                    placeholder="Timing (e.g. Every 20 min)"
                    value={newTransitTiming}
                    onChange={(e) => setNewTransitTiming(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="sm:col-span-3"
                    onClick={addTransitRoute}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Transit Route
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={saveProfile} disabled={isSavingProfile}>
                  {isSavingProfile && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Room types */}
          <Card className="border border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Room Types</CardTitle>
              <CardDescription>
                Bed inventory and pricing per room category.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(hostel.roomTypes || []).length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No room types yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {hostel.roomTypes.map((rt) => (
                    <div
                      key={rt.id}
                      className="flex items-center justify-between gap-2 border p-3 rounded-lg bg-muted/10"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold break-words">
                          {rt.name}
                        </p>
                        <p className="text-xs text-muted-foreground break-words">
                          {rt.totalBeds} beds &middot; {rt.availableBeds}{" "}
                          available &middot; ₹{rt.annualPlanPrice}/yr
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() =>
                          deleteRoomType({ hostelId: hostel.id, id: rt.id })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid gap-2 sm:grid-cols-2 p-3 border rounded-lg bg-muted/5">
                <Input
                  placeholder="Category (e.g. 2-Sharing AC)"
                  className="sm:col-span-2"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
                <Input
                  placeholder="Description"
                  className="sm:col-span-2"
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Total Beds"
                  value={roomBeds}
                  onChange={(e) => setRoomBeds(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Annual Price"
                  value={roomAnnualPrice}
                  onChange={(e) => setRoomAnnualPrice(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Monthly Price"
                  value={roomMonthlyPrice}
                  onChange={(e) => setRoomMonthlyPrice(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Admission Fee"
                  value={roomAdmissionFee}
                  onChange={(e) => setRoomAdmissionFee(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Security Deposit"
                  value={roomDeposit}
                  onChange={(e) => setRoomDeposit(e.target.value)}
                />
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">
                    Room Photos (up to {MAX_ROOM_PHOTOS})
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {roomPhotos.map((photoUrl, slot) => {
                      const uploadKey = `roomPhoto_${slot}`;
                      return (
                        <div key={slot} className="space-y-1">
                          {photoUrl ? (
                            <div className="relative">
                              <img
                                src={photoUrl}
                                alt={`Room photo ${slot + 1}`}
                                className="h-16 w-full rounded-md border object-cover"
                              />
                              <button
                                type="button"
                                className="absolute -top-1.5 -right-1.5 rounded-full bg-background border text-destructive p-0.5"
                                onClick={() =>
                                  setRoomPhotos((prev) =>
                                    prev.map((p, i) => (i === slot ? "" : p)),
                                  )
                                }
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <Input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="h-16 text-[10px] p-1"
                              disabled={uploadingField === uploadKey}
                              onChange={(e) =>
                                handleImageUpload(
                                  e.target.files?.[0] ?? null,
                                  uploadKey,
                                  `hostels/${hostel.id}/room-types/photo-${slot}`,
                                  (url) =>
                                    setRoomPhotos((prev) =>
                                      prev.map((p, i) =>
                                        i === slot ? url : p,
                                      ),
                                    ),
                                )
                              }
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="sm:col-span-2"
                  onClick={addRoomType}
                  disabled={isAddingRoomType}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Room Type
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mess plans */}
          <Card className="border border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Mess Plans</CardTitle>
              <CardDescription>
                Meal plans available to residents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(hostel.messPlans || []).length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No mess plans yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {hostel.messPlans!.map((mp) => (
                    <div
                      key={mp.id}
                      className="flex items-center justify-between gap-2 border p-3 rounded-lg bg-muted/10"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold break-words">
                          {mp.name}
                        </p>
                        <p className="text-xs text-muted-foreground break-words">
                          {mp.mealsIncluded.join(", ")} &middot; ₹
                          {mp.priceMonthly}
                          /mo
                          {mp.isCompulsory ? " · Compulsory" : ""}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() =>
                          deleteMessPlan({ hostelId: hostel.id, id: mp.id })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid gap-2 sm:grid-cols-2 p-3 border rounded-lg bg-muted/5">
                <Input
                  placeholder="Plan name (e.g. Standard Plan)"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Monthly Price"
                  value={mealPrice}
                  onChange={(e) => setMealPrice(e.target.value)}
                />
                <Input
                  placeholder="Meals included (comma separated)"
                  className="sm:col-span-2"
                  value={mealIncluded}
                  onChange={(e) => setMealIncluded(e.target.value)}
                />
                <Input
                  placeholder="Duration (e.g. 1 Month)"
                  value={mealDuration}
                  onChange={(e) => setMealDuration(e.target.value)}
                />
                <Input
                  placeholder="Dietary options (comma separated, e.g. Veg, Non-Veg)"
                  value={mealDietaryOptions}
                  onChange={(e) => setMealDietaryOptions(e.target.value)}
                />
                <label className="flex items-center gap-2 text-xs sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={mealCompulsory}
                    onChange={(e) => setMealCompulsory(e.target.checked)}
                  />
                  Compulsory for all residents
                </label>
                <Button
                  type="button"
                  variant="secondary"
                  className="sm:col-span-2"
                  onClick={addMessPlan}
                  disabled={isAddingMessPlan}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Mess Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Addon services */}
          <Card className="border border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Addon Services
              </CardTitle>
              <CardDescription>
                Laundry, gym, parking, and other optional charges.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {addonsByType.map(
                ({ type, items }) =>
                  items.length > 0 && (
                    <div key={type} className="space-y-2">
                      <Label className="text-xs uppercase font-bold text-muted-foreground">
                        {type}
                      </Label>
                      {items.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between gap-2 border p-3 rounded-lg bg-muted/10"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold break-words">
                              {service.name}
                            </p>
                            <p className="text-xs text-muted-foreground break-words">
                              {service.plans
                                .map((p) => {
                                  const base = `${p.label}: ₹${p.price}`;
                                  const tags =
                                    p.feature_tags && p.feature_tags.length > 0
                                      ? ` (${p.feature_tags.join(", ")})`
                                      : "";
                                  return base + tags;
                                })
                                .join(", ")}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                            onClick={() =>
                              deleteAddonService({
                                hostelId: hostel.id,
                                id: service.id,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ),
              )}

              <div className="grid gap-2 sm:grid-cols-2 p-3 border rounded-lg bg-muted/5">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={addonType}
                  onChange={(e) => setAddonType(e.target.value)}
                >
                  {ADDON_SERVICE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Service name (e.g. Laundry Charges)"
                  value={addonName}
                  onChange={(e) => setAddonName(e.target.value)}
                />
                <Input
                  placeholder="Plan label (e.g. Monthly)"
                  value={addonPlanLabel}
                  onChange={(e) => setAddonPlanLabel(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={addonPlanPrice}
                  onChange={(e) => setAddonPlanPrice(e.target.value)}
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={addonPlanPeriod}
                  onChange={(e) =>
                    setAddonPlanPeriod(
                      e.target.value as (typeof ADDON_PLAN_PERIODS)[number],
                    )
                  }
                >
                  {ADDON_PLAN_PERIODS.map((p) => (
                    <option key={p} value={p}>
                      {ADDON_PLAN_PERIOD_LABELS[p]}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Feature tags (comma separated, e.g. Detergent, Ironing)"
                  className="sm:col-span-2"
                  value={addonPlanFeatureTags}
                  onChange={(e) => setAddonPlanFeatureTags(e.target.value)}
                />
                <Input
                  placeholder="Note (e.g. Drop off on weekends)"
                  className="sm:col-span-2"
                  value={addonNotes}
                  onChange={(e) => setAddonNotes(e.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="sm:col-span-2"
                  onClick={addAddonService}
                  disabled={isAddingAddon}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Addon Service
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
