"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  UserPlus,
  Mail,
  Phone,
  GraduationCap,
  Users,
  RefreshCw,
  Eye,
  Hash,
  EyeOff,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { uploadCollegeAdminFile } from "@/lib/services/colleges.service";
import { useAmbassadors, useCreateAmbassador } from "@/hooks/use-ambassadors";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const createAmbassadorSchema = z
  .object({
    full_name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone_number: z.string().optional(),
    ambassador_type: z.enum(["student", "teacher"], {
      error: "Select a type",
    }),
    avatar_url: z.string().optional().default(""),
    course: z.string().trim().optional().default(""),
    district: z.string().trim().optional().default(""),
    state: z.string().trim().optional().default(""),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm the password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type CreateAmbassadorForm = z.infer<typeof createAmbassadorSchema>;

const STATUS_VARIANT: Record<
  string,
  "default" | "success" | "warning" | "destructive"
> = {
  active: "success",
  inactive: "warning",
  suspended: "destructive",
};

export default function AmbassadorsPage() {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const collegeId = useAuthStore((s) => s.user?.collegeId);
  const { data: ambassadors = [], isLoading, refetch } = useAmbassadors();
  const { mutate: create, isPending } = useCreateAmbassador();

  const form = useForm<CreateAmbassadorForm>({
    resolver: zodResolver(createAmbassadorSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone_number: "",
      ambassador_type: undefined,
      avatar_url: "",
      course: "",
      district: "",
      state: "",
      password: "",
      confirm_password: "",
    },
  });

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

  function onSubmit(values: CreateAmbassadorForm) {
    if (!collegeId) return;
    create(
      {
        ...values,
        college_id: collegeId,
        avatar_url: values.avatar_url || undefined,
        course: values.course || undefined,
        district: values.district || undefined,
        state: values.state || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Campus ambassador created successfully");
          setOpen(false);
          form.reset();
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Campus Ambassadors
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage campus ambassadors who promote your college
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Ambassador
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Campus Ambassador</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 mt-2"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    placeholder="Full name"
                    {...form.register("full_name")}
                  />
                  {form.formState.errors.full_name && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.full_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email address"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.email.message}
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
                    onValueChange={(v) =>
                      form.setValue(
                        "ambassador_type",
                        v as "student" | "teacher",
                        { shouldValidate: true },
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
                  {form.formState.errors.ambassador_type && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.ambassador_type.message}
                    </p>
                  )}
                </div>

                {/* Profile Photo */}
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

                {/* Course, District, State */}
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

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
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
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat password"
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
                    onClick={() => {
                      setOpen(false);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Creating..." : "Create Ambassador"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Ambassador</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-10 w-[200px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-14" />
                    </TableCell>
                  </TableRow>
                ))
              ) : ambassadors.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground/50" />
                      <p>No campus ambassadors yet.</p>
                      <p className="text-xs">
                        Click &quot;Add Ambassador&quot; to create the first
                        one.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                ambassadors.map((a) => (
                  <TableRow
                    key={a.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                          {a.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {a.fullName}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {a.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {a.campusCode ? (
                        <div className="flex items-center gap-1 font-mono text-xs bg-muted px-2 py-1 rounded w-fit">
                          <Hash className="h-3 w-3 text-muted-foreground" />
                          {a.campusCode}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1.5 capitalize">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {a.ambassadorType ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {a.phoneNumber ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {a.phoneNumber}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={STATUS_VARIANT[a.status] ?? "default"}
                        className="capitalize"
                      >
                        {a.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        asChild
                      >
                        <Link href={`/ambassadors/${a.id}`}>
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
