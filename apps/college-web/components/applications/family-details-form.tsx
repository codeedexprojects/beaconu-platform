"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Shield, User } from "lucide-react";
import { zodResolver } from "@/lib/zod-resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { IconSectionHeader } from "@/components/ui/icon-section-header";
import {
  useFormDetails,
  useUpdateFamilyDetails,
} from "@/hooks/use-application";

const familyDetailsSchema = z.object({
  father_name: z
    .string()
    .trim()
    .min(1, "Father&apos;s name is required")
    .max(255),
  father_occupation: z.string().trim().max(100).optional(),
  father_phone: z.string().trim().max(15).optional(),
  father_email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  mother_name: z
    .string()
    .trim()
    .min(1, "Mother&apos;s name is required")
    .max(255),
  mother_occupation: z.string().trim().max(100).optional(),
  mother_phone: z.string().trim().max(15).optional(),
  mother_email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  guardian_name: z.string().trim().max(255).optional(),
  guardian_relation: z.string().trim().max(50).optional(),
  guardian_phone: z.string().trim().max(15).optional(),
  annual_family_income: z.coerce.number().min(0).optional(),
  number_of_siblings: z.coerce.number().int().min(0).optional(),
});

type FamilyDetailsFormInput = z.infer<typeof familyDetailsSchema>;

interface FamilyDetailsFormProps {
  applicationId: string;
  onSaved?: () => void;
}

export function FamilyDetailsForm({
  applicationId,
  onSaved,
}: FamilyDetailsFormProps) {
  const { data: existing, isLoading } = useFormDetails(
    applicationId,
    "family_details",
    true,
  );
  const { mutate: save, isPending } = useUpdateFamilyDetails(applicationId);

  const form = useForm<FamilyDetailsFormInput>({
    resolver: zodResolver(familyDetailsSchema),
    defaultValues: {
      father_name: "",
      father_occupation: "",
      father_phone: "",
      father_email: "",
      mother_name: "",
      mother_occupation: "",
      mother_phone: "",
      mother_email: "",
      guardian_name: "",
      guardian_relation: "",
      guardian_phone: "",
    },
  });

  useEffect(() => {
    if (!existing) return;
    form.reset({
      father_name: existing.father_name ?? "",
      father_occupation: existing.father_occupation ?? "",
      father_phone: existing.father_phone ?? "",
      father_email: existing.father_email ?? "",
      mother_name: existing.mother_name ?? "",
      mother_occupation: existing.mother_occupation ?? "",
      mother_phone: existing.mother_phone ?? "",
      mother_email: existing.mother_email ?? "",
      guardian_name: existing.guardian_name ?? "",
      guardian_relation: existing.guardian_relation ?? "",
      guardian_phone: existing.guardian_phone ?? "",
      annual_family_income: existing.annual_family_income ?? undefined,
      number_of_siblings: existing.number_of_siblings ?? undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  function onSubmit(data: FamilyDetailsFormInput) {
    save(
      {
        father_name: data.father_name,
        father_occupation: data.father_occupation || undefined,
        father_phone: data.father_phone || undefined,
        father_email: data.father_email || undefined,
        mother_name: data.mother_name,
        mother_occupation: data.mother_occupation || undefined,
        mother_phone: data.mother_phone || undefined,
        mother_email: data.mother_email || undefined,
        guardian_name: data.guardian_name || undefined,
        guardian_relation: data.guardian_relation || undefined,
        guardian_phone: data.guardian_phone || undefined,
        annual_family_income: data.annual_family_income ?? undefined,
        number_of_siblings: data.number_of_siblings ?? undefined,
      },
      {
        onSuccess: () => {
          toast.success("Family details saved");
          onSaved?.();
        },
      },
    );
  }

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-2xl border bg-muted" />;
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-4"
    >
      <div className="space-y-4 rounded-2xl border border-border/60 p-5">
        <IconSectionHeader icon={User} title="Father's Details" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Full Name"
            error={form.formState.errors.father_name?.message}
          >
            <Input
              placeholder="Enter father's full name"
              {...form.register("father_name")}
            />
          </Field>
          <Field label="Occupation" optional>
            <Input
              placeholder="e.g. Software Engineer"
              {...form.register("father_occupation")}
            />
          </Field>
          <Field label="Mobile Number" optional>
            <Input {...form.register("father_phone")} />
          </Field>
          <Field
            label="Email"
            optional
            error={form.formState.errors.father_email?.message}
          >
            <Input
              placeholder="mail@example.com"
              {...form.register("father_email")}
            />
          </Field>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border/60 p-5">
        <IconSectionHeader icon={User} title="Mother's Details" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Full Name"
            error={form.formState.errors.mother_name?.message}
          >
            <Input
              placeholder="Enter mother's full name"
              {...form.register("mother_name")}
            />
          </Field>
          <Field label="Occupation" optional>
            <Input
              placeholder="e.g. Software Engineer"
              {...form.register("mother_occupation")}
            />
          </Field>
          <Field label="Mobile Number" optional>
            <Input {...form.register("mother_phone")} />
          </Field>
          <Field
            label="Email"
            optional
            error={form.formState.errors.mother_email?.message}
          >
            <Input
              placeholder="mail@example.com"
              {...form.register("mother_email")}
            />
          </Field>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border/60 p-5">
        <IconSectionHeader icon={Shield} title="Guardian Details" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Guardian Name" optional>
            <Input
              placeholder="Full name of guardian"
              {...form.register("guardian_name")}
            />
          </Field>
          <Field label="Relationship" optional>
            <Input {...form.register("guardian_relation")} />
          </Field>
          <Field label="Contact Number" optional>
            <Input {...form.register("guardian_phone")} />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Annual Family Income" optional>
            <Input type="number" {...form.register("annual_family_income")} />
          </Field>
          <Field label="Number of Siblings" optional>
            <Input type="number" {...form.register("number_of_siblings")} />
          </Field>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-14 w-full rounded-full border-0 bg-gradient-to-r from-[hsl(var(--accent-orange-gradient-from))] to-[hsl(var(--accent-orange-gradient-to))] text-base font-semibold text-accentOrange-foreground shadow-md hover:opacity-95"
      >
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save & Continue
      </Button>
    </form>
  );
}
