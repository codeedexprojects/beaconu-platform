"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getBlinkRole, type BlinkRoleSlug } from "@/lib/roles";
import { useSubmitCounsellorRequest } from "@/hooks/use-counsellor-requests";
import { SubmissionSuccess } from "./submission-success";

const counsellorRequestSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone_number: z.string().trim().min(10, "Enter a valid phone number"),
  qualification: z.string().trim().min(1, "Tell us your qualification"),
  years_of_experience: z
    .string()
    .trim()
    .min(1, "Tell us your years of experience"),
  message: z
    .string()
    .trim()
    .min(20, "Tell us a bit more — at least 20 characters"),
});

type CounsellorRequestInput = z.infer<typeof counsellorRequestSchema>;

const COPY: Record<
  "academic" | "mindcare",
  {
    qualificationPlaceholder: string;
    messagePlaceholder: string;
    messageLabel: string;
  }
> = {
  academic: {
    qualificationPlaceholder: "M.Ed in Counselling Psychology",
    messageLabel: "Why do you want to counsel students with BeaconU?",
    messagePlaceholder:
      "Tell us about your academic counselling background and the kind of students you'd like to support...",
  },
  mindcare: {
    qualificationPlaceholder: "M.A. Clinical Psychology, RCI licensed",
    messageLabel: "Tell us about your mental health practice",
    messagePlaceholder:
      "Share your areas of focus, licensure/certifications, and why you'd like to support student wellbeing on BeaconU...",
  },
};

export function CounsellorRequestForm({
  counsellorType,
}: {
  counsellorType: "academic" | "mindcare";
}) {
  const [submitted, setSubmitted] = useState(false);
  const { mutate, isPending } = useSubmitCounsellorRequest();
  const copy = COPY[counsellorType];
  const roleSlug: BlinkRoleSlug =
    counsellorType === "academic"
      ? "academic-counsellor"
      : "mindcare-counsellor";
  const role = getBlinkRole(roleSlug)!;

  const form = useForm<CounsellorRequestInput>({
    resolver: zodResolver(counsellorRequestSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone_number: "",
      qualification: "",
      years_of_experience: "",
      message: "",
    },
  });

  function onSubmit(data: CounsellorRequestInput) {
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
          className="space-y-5"
          noValidate
        >
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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

          <div className="space-y-1.5">
            <Label htmlFor="qualification">Qualification / certification</Label>
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

          <p className="text-xs text-muted-foreground">
            No account is created at this stage — the Blink team reviews every
            request and will email you with next steps once it&apos;s approved.
          </p>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Send request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
