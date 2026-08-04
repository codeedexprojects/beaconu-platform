"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getBlinkRole, type BlinkRoleSlug } from "@/lib/roles";
import { useSubmitCounsellorRequest } from "@/hooks/use-counsellor-requests";
import { SubmissionSuccess } from "./submission-success";

const counsellorRequestSchema = z
  .object({
    full_name: z.string().trim().min(1, "Full name is required"),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    phone_number: z.string().trim().min(10, "Enter a valid phone number"),
    gender: z.enum(["male", "female", "non_binary", "prefer_not_to_say"], {
      error: "Select a gender",
    }),
    city: z.string().trim().min(1, "City is required"),
    qualification: z.string().trim().min(1, "Qualification is required"),
    years_of_experience: z
      .string()
      .trim()
      .min(1, "Years of experience is required"),
    known_languages: z.string().trim().min(1, "Enter at least one language"),
    specialization: z.string().trim().min(1, "Specialization is required"),
    license_number: z.string().trim().optional(),
    message: z
      .string()
      .trim()
      .min(20, "Tell us a bit more — at least 20 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type CounsellorRequestForm = z.infer<typeof counsellorRequestSchema>;

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

const COPY: Record<
  "academic" | "mindcare",
  {
    qualificationPlaceholder: string;
    specializationLabel: string;
    specializationPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    showLicense: boolean;
  }
> = {
  academic: {
    qualificationPlaceholder: "M.Ed in Counselling Psychology",
    specializationLabel: "Streams / subjects you counsel on",
    specializationPlaceholder:
      "e.g. Science, Commerce, Engineering, Medical, Arts",
    messageLabel: "Why do you want to counsel students with BeaconU?",
    messagePlaceholder:
      "Tell us about your academic counselling background and the kind of students you'd like to support...",
    showLicense: false,
  },
  mindcare: {
    qualificationPlaceholder: "M.A. Clinical Psychology, RCI licensed",
    specializationLabel: "Areas of focus",
    specializationPlaceholder:
      "e.g. Anxiety, Academic Stress, Depression, Relationship Issues",
    messageLabel: "Tell us about your mental health practice",
    messagePlaceholder:
      "Share your areas of focus, certifications, and why you'd like to support student wellbeing on BeaconU...",
    showLicense: true,
  },
};

export function CounsellorRequestForm({
  counsellorType,
}: {
  counsellorType: "academic" | "mindcare";
}) {
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate, isPending } = useSubmitCounsellorRequest();
  const copy = COPY[counsellorType];
  const roleSlug: BlinkRoleSlug =
    counsellorType === "academic"
      ? "academic-counsellor"
      : "mindcare-counsellor";
  const role = getBlinkRole(roleSlug)!;

  const form = useForm<CounsellorRequestForm>({
    resolver: zodResolver(counsellorRequestSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone_number: "",
      gender: undefined,
      city: "",
      qualification: "",
      years_of_experience: "",
      known_languages: "",
      specialization: "",
      license_number: "",
      message: "",
      password: "",
      confirm_password: "",
    },
  });

  function onSubmit(data: CounsellorRequestForm) {
    mutate(
      { ...data, counsellor_type: counsellorType },
      {
        onSuccess: () => {
          setSubmitted(true);
          toast.success("Request sent to the Blink team");
        },
      },
    );
  }

  if (submitted) {
    return <SubmissionSuccess role={role} />;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Personal Details
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  placeholder="Dr. Priya Nair"
                  {...form.register("full_name")}
                />
                {form.formState.errors.full_name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.full_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone_number">Phone number</Label>
                <Input
                  id="phone_number"
                  placeholder="+91 98765 43210"
                  {...form.register("phone_number")}
                />
                {form.formState.errors.phone_number && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.phone_number.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  {...form.register("gender")}
                >
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
                {form.formState.errors.gender && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.gender.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Kochi, Kerala"
                  {...form.register("city")}
                />
                {form.formState.errors.city && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.city.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="known_languages">Known languages</Label>
                <Input
                  id="known_languages"
                  placeholder="English, Malayalam, Hindi"
                  {...form.register("known_languages")}
                />
                {form.formState.errors.known_languages && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.known_languages.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Professional Details
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="qualification">
                  Qualification / certification
                </Label>
                <Input
                  id="qualification"
                  placeholder={copy.qualificationPlaceholder}
                  {...form.register("qualification")}
                />
                {form.formState.errors.qualification && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.qualification.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="years_of_experience">Years of experience</Label>
                <Input
                  id="years_of_experience"
                  placeholder="e.g. 5 years"
                  {...form.register("years_of_experience")}
                />
                {form.formState.errors.years_of_experience && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.years_of_experience.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <Label htmlFor="specialization">{copy.specializationLabel}</Label>
              <Input
                id="specialization"
                placeholder={copy.specializationPlaceholder}
                {...form.register("specialization")}
              />
              {form.formState.errors.specialization && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.specialization.message}
                </p>
              )}
            </div>

            {copy.showLicense && (
              <div className="mt-4 space-y-1.5">
                <Label htmlFor="license_number">
                  License / Registration number{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="license_number"
                  placeholder="RCI A12345"
                  {...form.register("license_number")}
                />
              </div>
            )}

            <div className="mt-4 space-y-1.5">
              <Label htmlFor="message">{copy.messageLabel}</Label>
              <Textarea
                id="message"
                placeholder={copy.messagePlaceholder}
                rows={4}
                {...form.register("message")}
              />
              {form.formState.errors.message && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.message.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Account Password
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Set a password to use when your account is approved.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
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
                  <p className="text-sm text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm_password">Confirm password</Label>
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
                  <p className="text-sm text-destructive">
                    {form.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Send request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
