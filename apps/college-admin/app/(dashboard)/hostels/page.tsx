"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import {
  Home,
  Plus,
  Trash2,
  Bed,
  MapPin,
  Loader2,
  DollarSign,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { getPortalPath, getCollegeSlugFromPath } from "@/lib/portal-path";

import {
  useCollegeHostels,
  useCreateCollegeHostel,
  useDeleteCollegeHostel,
} from "@/hooks/use-facilities";

// ── Form schema ───────────────────────────────────────────────────────────────

const roomTypeFormSchema = z.object({
  name: z.string().trim().min(2, "Required"),
  totalBeds: z.coerce.number().int().positive("Must be > 0"),
  annualPlanPrice: z.coerce.number().nonnegative().default(0),
  monthlyPlanPrice: z.coerce.number().nonnegative().default(0),
  securityDeposit: z.coerce.number().nonnegative().default(0),
});

const messPlanFormSchema = z.object({
  name: z.string().trim().min(2, "Required"),
  priceMonthly: z.coerce.number().positive("Must be > 0"),
  mealsIncluded: z.string().trim().optional(),
});

const addonServiceFormSchema = z.object({
  serviceType: z.enum(["laundry", "gym", "parking", "other"]),
  name: z.string().trim().min(2, "Required"),
  planLabel: z.string().trim().min(1, "Required"),
  planPrice: z.coerce.number().nonnegative(),
  featureTags: z.string().trim().optional(),
});

const amenityFormSchema = z.object({
  name: z.string().trim().min(1, "Required"),
});

const ruleFormSchema = z.object({
  title: z.string().trim().min(1, "Required"),
  description: z.string().trim().min(1, "Required"),
});

const essentialFormSchema = z.object({
  type: z.string().trim().min(1, "Required"),
  name: z.string().trim().min(1, "Required"),
  distance: z.string().trim().optional(),
});

const hostelSchema = z.object({
  name: z.string().trim().min(2, "Hostel name is required").max(255),
  hostelType: z.enum(["boys", "girls", "co-ed"]),
  isOnCampus: z.boolean(),
  distanceFromCampus: z.string().optional(),
  description: z.string().optional(),
  totalBeds: z.coerce.number().int().positive("Must be > 0"),
  wardenName: z.string().optional(),
  wardenPhone: z.string().optional(),
  wardenWhatsapp: z.string().optional(),
  wardenEmail: z
    .union([z.string().trim().email("Invalid email"), z.literal("")])
    .optional(),
  address: z.string().optional(),
  roomTypes: z.array(roomTypeFormSchema),
  messPlans: z.array(messPlanFormSchema),
  addonServices: z.array(addonServiceFormSchema),
  amenities: z.array(amenityFormSchema),
  rules: z.array(ruleFormSchema),
  nearbyEssentials: z.array(essentialFormSchema),
});

type HostelFormData = z.infer<typeof hostelSchema>;

const DEFAULT_VALUES: HostelFormData = {
  name: "",
  hostelType: "co-ed",
  isOnCampus: true,
  distanceFromCampus: "",
  description: "",
  totalBeds: 100,
  wardenName: "",
  wardenPhone: "",
  wardenWhatsapp: "",
  wardenEmail: "",
  address: "",
  roomTypes: [],
  messPlans: [],
  addonServices: [],
  amenities: [],
  rules: [],
  nearbyEssentials: [],
};

const STEPS = [
  { key: "basics", label: "Basic Info" },
  { key: "rooms", label: "Room Types" },
  { key: "facilities", label: "Mess & Addons" },
  { key: "rules", label: "Amenities & Rules" },
  { key: "location", label: "Warden & Location" },
] as const;

// Fields validated before advancing past each step.
const STEP_FIELDS: Record<number, (keyof HostelFormData)[]> = {
  0: ["name", "hostelType", "totalBeds", "distanceFromCampus"],
  1: ["roomTypes"],
  2: ["messPlans", "addonServices"],
  3: ["amenities", "rules"],
  4: ["wardenEmail", "nearbyEssentials"],
};

export default function HostelsPage() {
  const user = useAuthStore((state) => state.user);
  const collegeSlug =
    typeof window === "undefined"
      ? null
      : getCollegeSlugFromPath(window.location.pathname, window.location.host);
  const { data: hostels = [], isLoading: loadingHostels } = useCollegeHostels();

  const { mutate: createHostel, isPending: creating } =
    useCreateCollegeHostel();
  const { mutate: deleteHostel } = useDeleteCollegeHostel();
  const canManageHostels =
    user?.roleSlug === "college_admin" ||
    (user?.permissions?.includes("hostel.manage") ?? false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [step, setStep] = useState(0);
  const [expandedHostel, setExpandedHostel] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<HostelFormData>({
    resolver: zodResolver(hostelSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const isOnCampus = watch("isOnCampus");

  const roomTypesArray = useFieldArray({ control, name: "roomTypes" });
  const messPlansArray = useFieldArray({ control, name: "messPlans" });
  const addonServicesArray = useFieldArray({ control, name: "addonServices" });
  const amenitiesArray = useFieldArray({ control, name: "amenities" });
  const rulesArray = useFieldArray({ control, name: "rules" });
  const essentialsArray = useFieldArray({ control, name: "nearbyEssentials" });

  const handleOpenAdd = () => {
    if (!canManageHostels) return;
    reset(DEFAULT_VALUES);
    setStep(0);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  const goNext = async () => {
    const fieldsToValidate = STEP_FIELDS[step] ?? [];
    const valid = await trigger(fieldsToValidate);
    if (!valid) {
      toast.error("Please fix the highlighted fields before continuing");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleDelete = (id: string, name: string) => {
    if (!canManageHostels) return;
    if (
      confirm(
        `Are you absolutely sure you want to remove hostel facility "${name}"?`,
      )
    ) {
      deleteHostel(id, {
        onSuccess: () => {
          toast.success(`Hostel facility "${name}" removed successfully`);
        },
      });
    }
  };

  const onSubmit = (data: HostelFormData) => {
    const payload = {
      name: data.name,
      hostelType: data.hostelType,
      isOnCampus: data.isOnCampus,
      distanceFromCampus: data.isOnCampus
        ? null
        : data.distanceFromCampus || null,
      description: data.description || null,
      totalBeds: data.totalBeds,
      roomTypes: data.roomTypes,
      messPlans: data.messPlans.map((mp) => ({
        name: mp.name,
        priceMonthly: mp.priceMonthly,
        mealsIncluded: (mp.mealsIncluded ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      })),
      addonServices: data.addonServices.map((service) => ({
        serviceType: service.serviceType,
        name: service.name,
        plans: [
          {
            label: service.planLabel,
            price: service.planPrice,
            feature_tags: (service.featureTags ?? "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          },
        ],
      })),
      wardenInfo: {
        name: data.wardenName || undefined,
        phone: data.wardenPhone || undefined,
        whatsapp: data.wardenWhatsapp || undefined,
        email: data.wardenEmail || undefined,
      },
      amenities: data.amenities,
      rules: data.rules,
      locationInfo: {
        address: data.address || undefined,
        nearbyEssentials: data.nearbyEssentials,
      },
    };

    createHostel(payload, {
      onSuccess: () => {
        toast.success("Hostel facility provisioned successfully");
        handleCloseModal();
        reset(DEFAULT_VALUES);
      },
      onError: (error) => {
        console.error("[CreateHostel] failed", error);
      },
    });
  };

  const onInvalid = () => {
    toast.error("Please fix the highlighted fields before submitting");
  };

  if (loadingHostels) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hostels & Rooms Occupancy
          </h1>
          <p className="text-sm text-muted-foreground">
            Provision residence halls, define student room inventories, and
            track active bookings.
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="shadow-lg shadow-primary/10"
          disabled={!canManageHostels}
        >
          <Plus className="mr-2 h-4 w-4" /> Provision Hostel Hall
        </Button>
      </div>

      {/* Hostels cards list layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {hostels.map((hostel) => {
          const isExpanded = expandedHostel === hostel.id;
          return (
            <Card
              key={hostel.id}
              className="border border-border/50 bg-card/60 backdrop-blur-md transition-all duration-300 hover:shadow-md hover:border-border/80"
            >
              <CardHeader className="pb-3 flex flex-row justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg font-bold">
                      {hostel.name}
                    </CardTitle>
                  </div>
                  <div className="text-xs flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className="text-[10px] uppercase font-semibold"
                    >
                      {hostel.hostelType} Only
                    </Badge>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {hostel.isOnCampus
                        ? "On-Campus"
                        : `Off-Campus (${hostel.distanceFromCampus || "0"} km)`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={getPortalPath(collegeSlug, `/hostels/${hostel.id}`)}
                  >
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      Manage
                    </Button>
                  </Link>
                  {canManageHostels ? (
                    <button
                      type="button"
                      className="text-destructive hover:scale-105 p-1 rounded-md hover:bg-destructive/10"
                      onClick={() => handleDelete(hostel.id, hostel.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {hostel.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {hostel.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 border-t border-b border-border/40 py-3 my-2">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Total Beds
                    </p>
                    <p className="text-lg font-bold text-foreground flex items-center gap-1">
                      <Bed className="h-4 w-4 text-blue-500" />{" "}
                      {hostel.totalBeds || 0} Beds
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Room Categories
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {hostel.roomTypes?.length ?? 0} Types
                    </p>
                  </div>
                </div>

                {/* Expand/Collapse room details button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs font-semibold flex items-center justify-center gap-1 h-8"
                  onClick={() =>
                    setExpandedHostel(isExpanded ? null : hostel.id)
                  }
                >
                  {isExpanded ? (
                    <>
                      Hide Room Matrix <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      Expand Room Matrix <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>

                {/* Room categories rows drawer list */}
                {isExpanded && (
                  <div className="space-y-2.5 mt-3 pt-3 border-t border-border/30 animate-fadeIn">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Inventories & Pricing Plan
                    </p>
                    {hostel.roomTypes && hostel.roomTypes.length > 0 ? (
                      <div className="space-y-2">
                        {hostel.roomTypes.map((room) => (
                          <div
                            key={room.id}
                            className="flex justify-between items-center p-2.5 rounded-lg border border-border/40 bg-muted/20"
                          >
                            <div>
                              <p className="text-xs font-bold">{room.name}</p>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Bed className="h-3 w-3" /> {room.totalBeds}{" "}
                                total beds
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-blue-600 flex items-center justify-end font-mono">
                                <DollarSign className="h-3 w-3" />{" "}
                                {room.annualPlanPrice}/yr
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                                + {room.securityDeposit} deposit
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        No room categories defined.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {hostels.length === 0 && (
          <div className="col-span-2 py-12 text-center text-muted-foreground">
            <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground/60 mb-2" />
            No hostels provisioned yet.
          </div>
        )}
      </div>

      {/* Hostel Provisioning Wizard */}
      <Dialog
        open={showAddModal && canManageHostels}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Provision Hostel Hall</DialogTitle>
            <DialogDescription>
              Step {step + 1} of {STEPS.length} &middot; {STEPS[step].label}
            </DialogDescription>
          </DialogHeader>

          {/* Step progress indicator */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, idx) => (
              <button
                key={s.key}
                type="button"
                onClick={() => idx <= step && setStep(idx)}
                disabled={idx > step}
                className={cn(
                  "flex-1 h-1.5 rounded-full transition-colors",
                  idx <= step ? "bg-primary" : "bg-muted",
                )}
                title={s.label}
              />
            ))}
          </div>

          <form
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            className="space-y-5"
          >
            {/* STEP 0: Basic Info */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="hostel-name">Hostel Hall Name</Label>
                  <Input
                    id="hostel-name"
                    placeholder="e.g. CV Raman Boys Hostel"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="hostel-type">Target Allocation</Label>
                    <select
                      id="hostel-type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                      {...register("hostelType")}
                    >
                      <option value="co-ed">Co-Educational</option>
                      <option value="boys">Boys Only</option>
                      <option value="girls">Girls Only</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="hostel-beds">Total Beds Capacity</Label>
                    <Input
                      id="hostel-beds"
                      type="number"
                      placeholder="250"
                      {...register("totalBeds")}
                    />
                    {errors.totalBeds && (
                      <p className="text-xs text-destructive">
                        {errors.totalBeds.message}
                      </p>
                    )}
                  </div>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hostel-campus"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    {...register("isOnCampus")}
                  />
                  <Label htmlFor="hostel-campus" className="!mb-0">
                    Located On-Campus
                  </Label>
                </label>

                {!isOnCampus && (
                  <div className="space-y-1.5">
                    <Label htmlFor="hostel-dist">
                      Distance from campus (km)
                    </Label>
                    <Input
                      id="hostel-dist"
                      placeholder="e.g. 1.8"
                      {...register("distanceFromCampus")}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="hostel-desc">Description</Label>
                  <Textarea
                    id="hostel-desc"
                    placeholder="Modern rooms with laundry facility..."
                    {...register("description")}
                  />
                </div>
              </div>
            )}

            {/* STEP 1: Room Types */}
            {step === 1 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">
                    Room Categories & Pricing Plans
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      roomTypesArray.append({
                        name: "",
                        totalBeds: 10,
                        annualPlanPrice: 0,
                        monthlyPlanPrice: 0,
                        securityDeposit: 0,
                      })
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Room Type
                  </Button>
                </div>

                {roomTypesArray.fields.length === 0 && (
                  <p className="text-xs text-muted-foreground italic py-4 text-center border rounded-lg border-dashed">
                    No room categories yet. Click &quot;Add Room Type&quot; to
                    define one (optional — can also be added later).
                  </p>
                )}

                <div className="space-y-3">
                  {roomTypesArray.fields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="grid gap-2 sm:grid-cols-2 p-3 border rounded-lg bg-muted/10 border-border/40 relative"
                    >
                      <button
                        type="button"
                        className="absolute top-2 right-2 text-destructive"
                        onClick={() => roomTypesArray.remove(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-xs">Category Name</Label>
                        <Input
                          placeholder="e.g. Double AC Sharing"
                          className="h-8 text-xs"
                          {...register(`roomTypes.${idx}.name`)}
                        />
                        {errors.roomTypes?.[idx]?.name && (
                          <p className="text-xs text-destructive">
                            {errors.roomTypes[idx]?.name?.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Beds Capacity</Label>
                        <Input
                          type="number"
                          className="h-8 text-xs"
                          {...register(`roomTypes.${idx}.totalBeds`)}
                        />
                        {errors.roomTypes?.[idx]?.totalBeds && (
                          <p className="text-xs text-destructive">
                            {errors.roomTypes[idx]?.totalBeds?.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Annual Price</Label>
                        <Input
                          type="number"
                          className="h-8 text-xs"
                          {...register(`roomTypes.${idx}.annualPlanPrice`)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Monthly Price</Label>
                        <Input
                          type="number"
                          className="h-8 text-xs"
                          {...register(`roomTypes.${idx}.monthlyPlanPrice`)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Security Deposit</Label>
                        <Input
                          type="number"
                          className="h-8 text-xs"
                          {...register(`roomTypes.${idx}.securityDeposit`)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Mess Plans & Addon Services */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold">Mess Plans</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        messPlansArray.append({
                          name: "",
                          priceMonthly: 0,
                          mealsIncluded: "",
                        })
                      }
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Mess Plan
                    </Button>
                  </div>
                  {messPlansArray.fields.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-3 text-center border rounded-lg border-dashed">
                      No mess plans yet (optional).
                    </p>
                  )}
                  <div className="space-y-3">
                    {messPlansArray.fields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="grid gap-2 sm:grid-cols-2 p-3 border rounded-lg bg-muted/10 border-border/40 relative"
                      >
                        <button
                          type="button"
                          className="absolute top-2 right-2 text-destructive"
                          onClick={() => messPlansArray.remove(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-xs">Plan Name</Label>
                          <Input
                            placeholder="e.g. Standard Plan"
                            className="h-8 text-xs"
                            {...register(`messPlans.${idx}.name`)}
                          />
                          {errors.messPlans?.[idx]?.name && (
                            <p className="text-xs text-destructive">
                              {errors.messPlans[idx]?.name?.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Monthly Price</Label>
                          <Input
                            type="number"
                            className="h-8 text-xs"
                            {...register(`messPlans.${idx}.priceMonthly`)}
                          />
                          {errors.messPlans?.[idx]?.priceMonthly && (
                            <p className="text-xs text-destructive">
                              {errors.messPlans[idx]?.priceMonthly?.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">
                            Meals (comma separated)
                          </Label>
                          <Input
                            placeholder="Breakfast, Lunch, Dinner"
                            className="h-8 text-xs"
                            {...register(`messPlans.${idx}.mealsIncluded`)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4 border-border/40">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold">
                      Addon Services (Laundry / Gym / Parking)
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        addonServicesArray.append({
                          serviceType: "laundry",
                          name: "",
                          planLabel: "Monthly",
                          planPrice: 0,
                          featureTags: "",
                        })
                      }
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Service
                    </Button>
                  </div>
                  {addonServicesArray.fields.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-3 text-center border rounded-lg border-dashed">
                      No addon services yet (optional).
                    </p>
                  )}
                  <div className="space-y-3">
                    {addonServicesArray.fields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="grid gap-2 sm:grid-cols-2 p-3 border rounded-lg bg-muted/10 border-border/40 relative"
                      >
                        <button
                          type="button"
                          className="absolute top-2 right-2 text-destructive"
                          onClick={() => addonServicesArray.remove(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <div className="space-y-1">
                          <Label className="text-xs">Type</Label>
                          <select
                            className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                            {...register(`addonServices.${idx}.serviceType`)}
                          >
                            <option value="laundry">Laundry</option>
                            <option value="gym">Gym</option>
                            <option value="parking">Parking</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Service Name</Label>
                          <Input
                            placeholder="e.g. Laundry Charges"
                            className="h-8 text-xs"
                            {...register(`addonServices.${idx}.name`)}
                          />
                          {errors.addonServices?.[idx]?.name && (
                            <p className="text-xs text-destructive">
                              {errors.addonServices[idx]?.name?.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Plan Label</Label>
                          <Input
                            placeholder="e.g. Monthly"
                            className="h-8 text-xs"
                            {...register(`addonServices.${idx}.planLabel`)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Price</Label>
                          <Input
                            type="number"
                            className="h-8 text-xs"
                            {...register(`addonServices.${idx}.planPrice`)}
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <Label className="text-xs">
                            Feature Tags (comma separated)
                          </Label>
                          <Input
                            placeholder="e.g. Detergent, Ironing"
                            className="h-8 text-xs"
                            {...register(`addonServices.${idx}.featureTags`)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Amenities & Rules */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold">Amenities</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => amenitiesArray.append({ name: "" })}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Amenity
                    </Button>
                  </div>
                  {amenitiesArray.fields.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-3 text-center border rounded-lg border-dashed">
                      No amenities yet (optional).
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {amenitiesArray.fields.map((field, idx) => (
                      <div key={field.id} className="flex items-center gap-1">
                        <Input
                          placeholder="e.g. High Speed Wi-Fi"
                          className="h-8 text-xs w-44"
                          {...register(`amenities.${idx}.name`)}
                        />
                        <button
                          type="button"
                          onClick={() => amenitiesArray.remove(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4 border-border/40">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold">Rules</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        rulesArray.append({ title: "", description: "" })
                      }
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Rule
                    </Button>
                  </div>
                  {rulesArray.fields.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-3 text-center border rounded-lg border-dashed">
                      No rules yet (optional).
                    </p>
                  )}
                  <div className="space-y-2">
                    {rulesArray.fields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="grid gap-2 sm:grid-cols-2 p-3 border rounded-lg bg-muted/10 border-border/40 relative"
                      >
                        <button
                          type="button"
                          className="absolute top-2 right-2 text-destructive"
                          onClick={() => rulesArray.remove(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <Input
                          placeholder="Rule title (e.g. Curfew Time)"
                          className="h-8 text-xs"
                          {...register(`rules.${idx}.title`)}
                        />
                        <Input
                          placeholder="Description"
                          className="h-8 text-xs"
                          {...register(`rules.${idx}.description`)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Warden & Location */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Warden Info</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      placeholder="Name"
                      className="h-8 text-xs"
                      {...register("wardenName")}
                    />
                    <Input
                      placeholder="Phone"
                      className="h-8 text-xs"
                      {...register("wardenPhone")}
                    />
                    <Input
                      placeholder="WhatsApp"
                      className="h-8 text-xs"
                      {...register("wardenWhatsapp")}
                    />
                    <Input
                      placeholder="Email"
                      className="h-8 text-xs"
                      {...register("wardenEmail")}
                    />
                  </div>
                  {errors.wardenEmail && (
                    <p className="text-xs text-destructive">
                      {errors.wardenEmail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3 border-t pt-4 border-border/40">
                  <Label className="text-sm font-semibold">Location</Label>
                  <Input
                    placeholder="Address"
                    className="h-8 text-xs"
                    {...register("address")}
                  />

                  <div className="flex justify-between items-center pt-2">
                    <Label className="text-xs text-muted-foreground">
                      Nearby Essentials
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        essentialsArray.append({
                          type: "",
                          name: "",
                          distance: "",
                        })
                      }
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Essential
                    </Button>
                  </div>
                  {essentialsArray.fields.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-3 text-center border rounded-lg border-dashed">
                      No nearby essentials yet (optional).
                    </p>
                  )}
                  <div className="space-y-2">
                    {essentialsArray.fields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="grid gap-2 sm:grid-cols-3 p-3 border rounded-lg bg-muted/10 border-border/40 relative"
                      >
                        <button
                          type="button"
                          className="absolute top-2 right-2 text-destructive"
                          onClick={() => essentialsArray.remove(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <Input
                          placeholder="Type (e.g. Hospital)"
                          className="h-8 text-xs"
                          {...register(`nearbyEssentials.${idx}.type`)}
                        />
                        <Input
                          placeholder="Name"
                          className="h-8 text-xs"
                          {...register(`nearbyEssentials.${idx}.name`)}
                        />
                        <Input
                          placeholder="Distance (e.g. 3.0 km)"
                          className="h-8 text-xs"
                          {...register(`nearbyEssentials.${idx}.distance`)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="pt-2 border-t border-border/40 sm:justify-between">
              <div className="flex gap-2">
                {step > 0 && (
                  <Button type="button" variant="outline" onClick={goBack}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button type="button" onClick={goNext}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={creating}>
                    {creating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Provision Hostel
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
