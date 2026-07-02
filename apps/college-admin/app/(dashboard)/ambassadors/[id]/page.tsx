"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  Phone,
  GraduationCap,
  Hash,
  Pencil,
  Loader2,
  CalendarCheck,
  Clock3,
  CheckCircle2,
  Ban,
  Eye,
  EyeOff,
} from "lucide-react";

import { uploadCollegeAdminFile } from "@/lib/services/colleges.service";
import { useAmbassador, useUpdateAmbassador } from "@/hooks/use-ambassadors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_VARIANT: Record<
  string,
  "default" | "success" | "warning" | "destructive"
> = {
  active: "success",
  inactive: "warning",
  suspended: "destructive",
};

const editAmbassadorSchema = z
  .object({
    full_name: z.string().min(1, "Name is required"),
    phone_number: z.string().optional().default(""),
    ambassador_type: z.enum(["student", "teacher"]),
    avatar_url: z.string().optional().default(""),
    course: z.string().trim().optional().default(""),
    district: z.string().trim().optional().default(""),
    state: z.string().trim().optional().default(""),
    status: z.enum(["active", "inactive"]),
    password: z
      .string()
      .optional()
      .default("")
      .refine((v) => !v || v.length >= 8, {
        message: "Password must be at least 8 characters",
      }),
    confirm_password: z.string().optional().default(""),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type EditAmbassadorForm = z.infer<typeof editAmbassadorSchema>;

export default function AmbassadorDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: ambassador, isLoading } = useAmbassador(params.id);
  const { mutate: update, isPending: isSaving } = useUpdateAmbassador(
    params.id,
  );

  const [open, setOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<EditAmbassadorForm>({
    resolver: zodResolver(editAmbassadorSchema),
    defaultValues: {
      full_name: "",
      phone_number: "",
      ambassador_type: "student",
      avatar_url: "",
      course: "",
      district: "",
      state: "",
      status: "active",
      password: "",
      confirm_password: "",
    },
  });

  useEffect(() => {
    if (!ambassador) return;
    form.reset({
      full_name: ambassador.fullName,
      phone_number: ambassador.phoneNumber ?? "",
      ambassador_type:
        (ambassador.ambassadorType as "student" | "teacher") ?? "student",
      avatar_url: ambassador.avatarUrl ?? "",
      course: ambassador.course ?? "",
      district: ambassador.district ?? "",
      state: ambassador.state ?? "",
      status: ambassador.status === "inactive" ? "inactive" : "active",
      password: "",
      confirm_password: "",
    });
  }, [ambassador]);

  async function handleAvatarUpload(file: File | null) {
    if (!file) return;
    try {
      setUploadingAvatar(true);
      const url = await uploadCollegeAdminFile(file, "ambassadors/avatar");
      form.setValue("avatar_url", url, { shouldDirty: true });
      toast.success("Photo uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  }

  function onSubmit(values: EditAmbassadorForm) {
    update(
      {
        full_name: values.full_name,
        phone_number: values.phone_number || undefined,
        ambassador_type: values.ambassador_type,
        avatar_url: values.avatar_url || undefined,
        course: values.course || undefined,
        district: values.district || undefined,
        state: values.state || undefined,
        status: values.status,
        password: values.password || undefined,
        confirm_password: values.confirm_password || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Campus ambassador updated");
          setOpen(false);
        },
      },
    );
  }

  if (isLoading || !ambassador) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const stats = ambassador.visitStats;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
            <Link href="/ambassadors">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back to Ambassadors
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              {ambassador.avatarUrl ? (
                <img
                  src={ambassador.avatarUrl}
                  alt={ambassador.fullName}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                ambassador.fullName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {ambassador.fullName}
              </h1>
              <div className="flex items-center gap-2">
                <Badge
                  variant={STATUS_VARIANT[ambassador.status] ?? "default"}
                  className="capitalize"
                >
                  {ambassador.status}
                </Badge>
                <Badge variant="outline" className="gap-1.5 capitalize">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {ambassador.ambassadorType ?? "—"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Campus Ambassador</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-2"
            >
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" {...form.register("full_name")} />
                {form.formState.errors.full_name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.full_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone_number">
                  Phone Number{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="phone_number"
                  placeholder="+91 9876543210"
                  {...form.register("phone_number")}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Ambassador Type</Label>
                <Select
                  value={form.watch("ambassador_type")}
                  onValueChange={(v) =>
                    form.setValue(
                      "ambassador_type",
                      v as "student" | "teacher",
                      {
                        shouldValidate: true,
                      },
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(v) =>
                    form.setValue("status", v as "active" | "inactive", {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>
                  Profile Photo{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <div className="flex items-center gap-3">
                  {form.watch("avatar_url") ? (
                    <img
                      src={form.watch("avatar_url")}
                      alt="Avatar preview"
                      className="h-12 w-12 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                      Photo
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={uploadingAvatar}
                      onChange={(e) =>
                        handleAvatarUpload(e.target.files?.[0] ?? null)
                      }
                    />
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                      {uploadingAvatar && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      )}
                      {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="course">
                  Course{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="course"
                  placeholder="e.g. B.Tech Computer Science"
                  {...form.register("course")}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="district">
                    District{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="district"
                    placeholder="District"
                    {...form.register("district")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state">
                    State{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="state"
                    placeholder="State"
                    {...form.register("state")}
                  />
                </div>
              </div>

              <div className="space-y-1.5 border-t pt-4">
                <Label htmlFor="password">
                  New Password{" "}
                  <span className="text-muted-foreground">
                    (leave blank to keep current password)
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-muted-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat new password"
                    {...form.register("confirm_password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-muted-foreground"
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {form.formState.errors.confirm_password && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campus Visit Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <CalendarCheck className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Total Visits</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <Clock3 className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-amber-500">
                {stats.pending}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-sm text-muted-foreground">Confirmed</p>
              <p className="text-2xl font-bold text-emerald-500">
                {stats.confirmed}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <Ban className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">
                Cancelled / Rejected
              </p>
              <p className="text-2xl font-bold text-destructive">
                {stats.cancelled + stats.rejected}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Details */}
      <Card>
        <CardContent className="grid gap-4 pt-4 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{ambassador.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{ambassador.phoneNumber ?? "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span>{ambassador.campusCode ?? "—"}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Joined {new Date(ambassador.createdAt).toLocaleDateString()}
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Course: </span>
            {ambassador.course ?? "—"}
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">District: </span>
            {ambassador.district ?? "—"}
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">State: </span>
            {ambassador.state ?? "—"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
