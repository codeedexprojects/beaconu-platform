"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import {
  Loader2,
  Settings,
  Image as ImageIcon,
  Save,
  CheckCircle,
  Network,
  Copy,
  Building2,
  Globe,
  EyeOff,
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { IndiaStateSelect } from "@/components/ui/india-state-select";
import { IndiaDistrictSelect } from "@/components/ui/india-district-select";
import { useAuthStore } from "@/store";

import {
  useCollegeProfile,
  useUpdateCollegeProfile,
  useMyInstitutionGroup,
  useJoinInstitutionGroup,
} from "@/hooks/use-colleges";
import { uploadCollegeAdminFile } from "@/lib/services/colleges.service";

const settingsFormSchema = z.object({
  name: z.string().trim().min(2, "College name is required"),
  code: z.string().trim().min(2, "College code is required"),
  logoUrl: z
    .string()
    .trim()
    .url("Enter a valid logo URL")
    .optional()
    .or(z.literal("")),
  coverImageUrl: z
    .string()
    .trim()
    .url("Enter a valid cover image URL")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().min(5, "Address is required"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  district: z.string().trim().min(2, "District is required"),
  pinCode: z.string().trim().min(6, "Valid PIN code is required"),
});

type SettingsFormData = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const { data: profile, isLoading } = useCollegeProfile();
  const { mutate: updateProfile, isPending } = useUpdateCollegeProfile();
  // Guards the form-hydration effect below so a background refetch of
  // `profile` (e.g. on window refocus) can't wipe in-progress edits —
  // including an already-uploaded logo/cover URL — by re-running `reset()`.
  const hasHydratedFormRef = useRef(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [listingModal, setListingModal] = useState<{
    open: boolean;
    next: boolean;
  }>({ open: false, next: false });
  const canEditProfile =
    user?.roleSlug === "college_admin" ||
    (user?.permissions?.includes("profile.edit") ?? false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
  });

  const selectedState = watch("state");

  const logoUrl = watch("logoUrl");
  const coverImageUrl = watch("coverImageUrl");

  async function handleLogoUpload(file: File | null) {
    if (!file) return;
    try {
      setUploadingLogo(true);
      const url = await uploadCollegeAdminFile(file, "settings/logo");
      setValue("logoUrl", url, { shouldDirty: true, shouldValidate: true });
      toast.success("Logo uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleCoverUpload(file: File | null) {
    if (!file) return;
    try {
      setUploadingCover(true);
      const url = await uploadCollegeAdminFile(file, "settings/cover");
      setValue("coverImageUrl", url, {
        shouldDirty: true,
        shouldValidate: true,
      });
      toast.success("Cover image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingCover(false);
    }
  }

  useEffect(() => {
    if (profile && !hasHydratedFormRef.current) {
      hasHydratedFormRef.current = true;
      reset({
        name: profile.name || "",
        code: profile.code || "",
        logoUrl: profile.logoUrl || "",
        coverImageUrl: profile.coverImageUrl || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        district: profile.district || "",
        pinCode: profile.pinCode || "",
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: SettingsFormData) => {
    if (!canEditProfile) {
      return;
    }

    updateProfile(data, {
      onSuccess: () => {
        toast.success("Settings updated successfully!");
      },
    });
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
      <div className="flex justify-between items-center border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" /> General settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your college branding, logos, cover images, and contact
            addresses.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Logo and Assets Column */}
          <div className="space-y-6 md:col-span-1">
            <Card className="border border-border/50 bg-card/60 backdrop-blur-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">
                  Logo & Branding
                </CardTitle>
                <CardDescription>
                  Update your institutional identity brand mark.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/20 border-dashed border-border/60">
                  {logoUrl ? (
                    <div className="relative h-28 w-28 rounded-2xl overflow-hidden shadow-md border bg-background">
                      <img
                        src={logoUrl}
                        alt="College Logo Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-primary/5 text-primary border shadow-sm">
                      <Settings className="h-10 w-10 text-primary/40 animate-pulse" />
                    </div>
                  )}
                  <span className="text-[11px] font-semibold text-muted-foreground mt-3 uppercase tracking-wider">
                    Logo preview
                  </span>
                </div>

                <div className="space-y-1.5">
                  <Label>Logo</Label>
                  <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border/60 bg-muted/20 px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted/40 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={uploadingLogo}
                      onChange={(e) =>
                        handleLogoUpload(e.target.files?.[0] ?? null)
                      }
                    />
                    {uploadingLogo ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                    {uploadingLogo ? "Uploading…" : "Upload logo file"}
                  </label>
                  {errors.logoUrl && (
                    <p className="text-xs text-destructive">
                      {errors.logoUrl.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-card/60 backdrop-blur-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">
                  Cover Image
                </CardTitle>
                <CardDescription>
                  Hero banner displayed on landing pages.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/20 border-dashed border-border/60">
                  {coverImageUrl ? (
                    <div className="relative h-20 w-full rounded-lg overflow-hidden shadow-sm border bg-background">
                      <img
                        src={coverImageUrl}
                        alt="Cover Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-20 w-full items-center justify-center rounded-lg bg-primary/5 text-primary border shadow-sm">
                      <ImageIcon className="h-6 w-6 text-primary/40" />
                    </div>
                  )}
                  <span className="text-[11px] font-semibold text-muted-foreground mt-3 uppercase tracking-wider">
                    Cover preview
                  </span>
                </div>

                <div className="space-y-1.5">
                  <Label>Cover Image</Label>
                  <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border/60 bg-muted/20 px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted/40 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={uploadingCover}
                      onChange={(e) =>
                        handleCoverUpload(e.target.files?.[0] ?? null)
                      }
                    />
                    {uploadingCover ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                    {uploadingCover ? "Uploading…" : "Upload cover file"}
                  </label>
                  {errors.coverImageUrl && (
                    <p className="text-xs text-destructive">
                      {errors.coverImageUrl.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile details column */}
          <div className="space-y-6 md:col-span-2">
            <Card className="border border-border/50 bg-card/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Institutional details and operational registry coordinates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="settings-name">College Name</Label>
                    <Input
                      id="settings-name"
                      placeholder="e.g. Anupam Institute of Technology"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="settings-code">
                      Institutional Registration Code
                    </Label>
                    <Input
                      id="settings-code"
                      placeholder="e.g. AIT-09"
                      {...register("code")}
                    />
                    {errors.code && (
                      <p className="text-xs text-destructive">
                        {errors.code.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Subdomain Routing Slug</Label>
                    <Input
                      value={profile?.slug || ""}
                      disabled
                      className="bg-muted text-muted-foreground"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Contact platform support to request subdomain changes.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Database Registry ID</Label>
                    <Input
                      value={profile?.id || ""}
                      disabled
                      className="bg-muted text-muted-foreground font-mono text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-card/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  Contact Address
                </CardTitle>
                <CardDescription>
                  Institutional postal codes and transit addresses.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="settings-address">Street Address</Label>
                  <Input
                    id="settings-address"
                    placeholder="123 Academic Block, Main Street"
                    {...register("address")}
                  />
                  {errors.address && (
                    <p className="text-xs text-destructive">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="settings-city">City</Label>
                    <Input
                      id="settings-city"
                      placeholder="Noida"
                      {...register("city")}
                    />
                    {errors.city && (
                      <p className="text-xs text-destructive">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>District</Label>
                    <Controller
                      name="district"
                      control={control}
                      render={({ field }) => (
                        <IndiaDistrictSelect
                          stateName={selectedState ?? ""}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    {errors.district && (
                      <p className="text-xs text-destructive">
                        {errors.district.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>State</Label>
                    <Controller
                      name="state"
                      control={control}
                      render={({ field }) => (
                        <IndiaStateSelect
                          value={field.value ?? ""}
                          onChange={(value) => {
                            field.onChange(value);
                            setValue("district", "");
                          }}
                        />
                      )}
                    />
                    {errors.state && (
                      <p className="text-xs text-destructive">
                        {errors.state.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="settings-pincode">ZIP / PIN Code</Label>
                    <Input
                      id="settings-pincode"
                      placeholder="201301"
                      {...register("pinCode")}
                    />
                    {errors.pinCode && (
                      <p className="text-xs text-destructive">
                        {errors.pinCode.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <InstitutionGroupCard />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t">
          <Button
            type="submit"
            size="lg"
            disabled={isPending || !canEditProfile}
            className="shadow-lg shadow-primary/10"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Configuration Settings
          </Button>
        </div>
      </form>

      {/* Public Listing Toggle */}
      {(() => {
        const isListed = profile?.settings?.isListed === true;
        return (
          <>
            <Card className="border border-border/50 bg-card/60 backdrop-blur-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      {isListed ? (
                        <Globe className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      Public Listing
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {isListed
                        ? "Your college is visible to students on the platform."
                        : "Your college is hidden from public discovery."}
                    </CardDescription>
                  </div>

                  {/* Toggle */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isListed}
                    disabled={!canEditProfile || isPending}
                    onClick={() =>
                      setListingModal({ open: true, next: !isListed })
                    }
                    className={[
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      isListed ? "bg-emerald-500" : "bg-input",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200",
                        isListed ? "translate-x-5" : "translate-x-0",
                      ].join(" ")}
                    />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className={[
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                    isListed
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                  {isListed
                    ? "Students can find and view your college profile."
                    : "College profile is unlisted. Toggle on to go live."}
                </div>
              </CardContent>
            </Card>

            {/* Confirmation modal */}
            <Dialog
              open={listingModal.open}
              onOpenChange={(open) => setListingModal((s) => ({ ...s, open }))}
            >
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>
                    {listingModal.next
                      ? "Make college publicly listed?"
                      : "Remove from public listing?"}
                  </DialogTitle>
                  <DialogDescription>
                    {listingModal.next
                      ? "Your college will become visible to students on the BeaconU platform. You can unpublish at any time."
                      : "Your college will be hidden from public discovery. Existing links and direct URLs will return not found."}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setListingModal({ open: false, next: false })
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={listingModal.next ? "default" : "destructive"}
                    disabled={isPending}
                    onClick={() => {
                      updateProfile(
                        { settings: { isListed: listingModal.next } },
                        {
                          onSuccess: () => {
                            toast.success(
                              listingModal.next
                                ? "College is now publicly listed."
                                : "College removed from public listing.",
                            );
                            setListingModal({ open: false, next: false });
                          },
                        },
                      );
                    }}
                  >
                    {isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {listingModal.next ? "Yes, publish" : "Yes, unpublish"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        );
      })()}
    </div>
  );
}

function InstitutionGroupCard() {
  const { data: groupData, isLoading } = useMyInstitutionGroup();
  const joinMutation = useJoinInstitutionGroup();
  const [code, setCode] = useState("");

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    joinMutation.mutate(code.trim(), {
      onSuccess: () => {
        setCode("");
      },
    });
  };

  const copyCode = (val: string) => {
    navigator.clipboard.writeText(val);
    toast.success("Group code copied!");
  };

  if (isLoading) {
    return (
      <Card className="border border-border/50 bg-card/60 backdrop-blur-md">
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // 1. Owner of a group
  if (groupData?.type === "owner" && groupData.group) {
    const group = groupData.group;
    return (
      <Card className="border border-border/50 bg-card/60 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" /> Institution Group
            </CardTitle>
            <CardDescription>
              You are the administrator of this college group.
            </CardDescription>
          </div>
          <Badge
            variant="default"
            className="bg-primary/10 text-primary border-primary/20"
          >
            Group Creator
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-primary/5 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-primary">
                Group Join Code
              </Label>
              <Badge
                variant="outline"
                className="text-[10px] border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
              >
                Active
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-lg font-bold font-mono tracking-widest text-primary">
                {group.groupCode}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 shrink-0"
                onClick={() => copyCode(group.groupCode)}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this code with affiliated colleges so they can join this
              group.
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold">{group.name}</p>
            {group.description && (
              <p className="text-xs text-muted-foreground">
                {group.description}
              </p>
            )}
          </div>

          <div className="space-y-2.5 pt-2 border-t">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Member Colleges ({group.members?.length ?? 0})
            </Label>
            {group.members && group.members.length > 0 ? (
              <div className="space-y-2">
                {group.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border bg-background/40 px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {member.college.logoUrl ? (
                        <img
                          src={member.college.logoUrl}
                          alt={member.college.name}
                          className="h-6 w-6 rounded object-cover"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium leading-none">
                          {member.college.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {member.college.code} ·{" "}
                          {[member.college.city, member.college.state]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        member.role === "admin" ? "default" : "secondary"
                      }
                      className="text-[10px] capitalize"
                    >
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                No colleges have joined yet. Share the code above to map
                affiliated colleges.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 2. Member of a group
  if (groupData?.type === "member" && groupData.membership) {
    const group = groupData.membership.group;
    return (
      <Card className="border border-border/50 bg-card/60 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" /> Institution Group
            </CardTitle>
            <CardDescription>
              Your college is mapped under a parent institution group.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            Group Member
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Parent Group
            </p>
            <p className="text-sm font-bold text-primary">{group.name}</p>
            {group.description && (
              <p className="text-xs text-muted-foreground">
                {group.description}
              </p>
            )}
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
            <span>Joined via Code</span>
            <span>
              {new Date(groupData.membership.joinedAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 3. Not in any group
  return (
    <Card className="border border-border/50 bg-card/60 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" /> Mapped Institution Group
        </CardTitle>
        <CardDescription>
          Join a group to link your college with a parent university or group of
          colleges.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="join-group-code">Group Code</Label>
            <div className="flex gap-2">
              <Input
                id="join-group-code"
                placeholder="e.g. IGC-ABCD-1234"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono tracking-widest text-center"
              />
              <Button
                type="submit"
                disabled={joinMutation.isPending || !code.trim()}
                className="shrink-0"
              >
                {joinMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Join Group"
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Ask your parent institution group administrator for the active
              group join code.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
