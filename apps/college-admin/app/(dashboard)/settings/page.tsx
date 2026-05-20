"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  Settings,
  Image as ImageIcon,
  Save,
  CheckCircle,
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
import { useAuthStore } from "@/store";

import {
  useCollegeProfile,
  useUpdateCollegeProfile,
} from "@/hooks/use-colleges";

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
  const canEditProfile =
    user?.roleSlug === "college_admin" ||
    (user?.permissions?.includes("profile.edit") ?? false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
  });

  const logoUrl = watch("logoUrl");
  const coverImageUrl = watch("coverImageUrl");

  useEffect(() => {
    if (profile) {
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
                  <Label htmlFor="settings-logo-url">Logo URL</Label>
                  <Input
                    id="settings-logo-url"
                    placeholder="https://example.com/logo.png"
                    {...register("logoUrl")}
                  />
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
                  <Label htmlFor="settings-cover-url">Cover Image URL</Label>
                  <Input
                    id="settings-cover-url"
                    placeholder="https://example.com/cover.png"
                    {...register("coverImageUrl")}
                  />
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
                    <Label htmlFor="settings-district">District</Label>
                    <Input
                      id="settings-district"
                      placeholder="Gautam Buddha Nagar"
                      {...register("district")}
                    />
                    {errors.district && (
                      <p className="text-xs text-destructive">
                        {errors.district.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="settings-state">State</Label>
                    <Input
                      id="settings-state"
                      placeholder="Uttar Pradesh"
                      {...register("state")}
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
    </div>
  );
}
