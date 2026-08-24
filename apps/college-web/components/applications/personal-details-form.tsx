"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { CreditCard, Loader2, Phone, User } from "lucide-react";
import { zodResolver } from "@/lib/zod-resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { IconSectionHeader } from "@/components/ui/icon-section-header";
import {
  useFormDetails,
  useUpdatePersonalDetails,
} from "@/hooks/use-application";

const personalDetailsSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required").max(255),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  category: z.string().trim().max(30).optional(),
  blood_group: z.string().trim().max(5).optional(),
  religion: z.string().trim().max(50).optional(),
  mother_tongue: z.string().trim().max(50).optional(),
  marital_status: z.string().trim().max(20).optional(),
  aadhar_number: z.string().trim().max(20).optional(),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  mobile_country_code: z.string().trim().max(5).optional(),
  mobile_number: z.string().trim().max(15).optional(),
  whatsapp_country_code: z.string().trim().max(5).optional(),
  whatsapp_number: z.string().trim().max(15).optional(),
});

type PersonalDetailsFormInput = z.infer<typeof personalDetailsSchema>;

interface PersonalDetailsFormProps {
  applicationId: string;
  onSaved?: () => void;
}

const genderOptions = [
  { value: "male" as const, label: "Male" },
  { value: "female" as const, label: "Female" },
  { value: "other" as const, label: "Other" },
];

const religionOptions = [
  "Hindu",
  "Muslim",
  "Christian",
  "Sikh",
  "Buddhist",
  "Jain",
  "Other",
];

const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const maritalStatusOptions = ["Single", "Married", "Other"];

// Older saved data was free text (any casing) before these became fixed
// dropdowns — normalize so e.g. "single" still shows as selected "Single"
// instead of silently appearing blank.
function matchOption(options: string[], value: string | undefined) {
  if (!value) return value;
  return options.find((o) => o.toLowerCase() === value.toLowerCase()) ?? value;
}

export function PersonalDetailsForm({
  applicationId,
  onSaved,
}: PersonalDetailsFormProps) {
  const { data: existing, isLoading } = useFormDetails(
    applicationId,
    "personal_details",
    true,
  );
  const { mutate: save, isPending } = useUpdatePersonalDetails(applicationId);

  const form = useForm<PersonalDetailsFormInput>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      full_name: "",
      date_of_birth: "",
      gender: "male",
      category: "",
      blood_group: "",
      religion: "",
      mother_tongue: "",
      marital_status: "",
      aadhar_number: "",
      email: "",
      mobile_country_code: "",
      mobile_number: "",
      whatsapp_country_code: "",
      whatsapp_number: "",
    },
  });

  useEffect(() => {
    if (!existing) return;
    form.reset({
      full_name: existing.full_name ?? "",
      date_of_birth: existing.date_of_birth
        ? existing.date_of_birth.slice(0, 10)
        : "",
      gender: existing.gender ?? "male",
      category: existing.category ?? "",
      blood_group:
        matchOption(bloodGroupOptions, existing.blood_group ?? "") ?? "",
      religion: matchOption(religionOptions, existing.religion ?? "") ?? "",
      mother_tongue: existing.mother_tongue ?? "",
      marital_status:
        matchOption(maritalStatusOptions, existing.marital_status ?? "") ?? "",
      aadhar_number: existing.aadhar_number ?? "",
      email: existing.email ?? "",
      mobile_country_code: existing.mobile_country_code ?? "",
      mobile_number: existing.mobile_number ?? "",
      whatsapp_country_code: existing.whatsapp_country_code ?? "",
      whatsapp_number: existing.whatsapp_number ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  function onSubmit(data: PersonalDetailsFormInput) {
    save(
      {
        full_name: data.full_name,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        category: data.category || undefined,
        blood_group: data.blood_group || undefined,
        religion: data.religion || undefined,
        mother_tongue: data.mother_tongue || undefined,
        marital_status: data.marital_status || undefined,
        aadhar_number: data.aadhar_number || undefined,
        email: data.email || undefined,
        mobile_country_code: data.mobile_country_code || undefined,
        mobile_number: data.mobile_number || undefined,
        whatsapp_country_code: data.whatsapp_country_code || undefined,
        whatsapp_number: data.whatsapp_number || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Personal details saved");
          onSaved?.();
        },
      },
    );
  }

  const gender = useWatch({ control: form.control, name: "gender" });
  const religion = useWatch({ control: form.control, name: "religion" });
  const bloodGroup = useWatch({ control: form.control, name: "blood_group" });
  const maritalStatus = useWatch({
    control: form.control,
    name: "marital_status",
  });

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
        <IconSectionHeader icon={User} title="Personal Details" />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Full Name"
            error={form.formState.errors.full_name?.message}
          >
            <Input
              placeholder="e.g. Alex Johnson"
              {...form.register("full_name")}
            />
          </Field>

          <Field
            label="Date of Birth"
            error={form.formState.errors.date_of_birth?.message}
          >
            <Input type="date" {...form.register("date_of_birth")} />
          </Field>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-foreground">
              Gender
            </label>
            <SegmentedToggle
              options={genderOptions}
              value={gender}
              onChange={(v) =>
                form.setValue("gender", v, { shouldValidate: true })
              }
              name="gender"
              className="max-w-md"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border/60 p-5">
        <IconSectionHeader icon={CreditCard} title="Identity Information" />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Aadhar Number" optional>
            <Input
              placeholder="XXXX-XXXX-XXXX"
              {...form.register("aadhar_number")}
            />
          </Field>

          <Field label="Religion" optional>
            <Select
              value={religion || undefined}
              onValueChange={(v) =>
                form.setValue("religion", v, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Religion" />
              </SelectTrigger>
              <SelectContent>
                {religionOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Community / Caste" optional>
            <Input
              placeholder="Enter community"
              {...form.register("category")}
            />
          </Field>

          <Field label="Blood Group" optional>
            <Select
              value={bloodGroup || undefined}
              onValueChange={(v) =>
                form.setValue("blood_group", v, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Group" />
              </SelectTrigger>
              <SelectContent>
                {bloodGroupOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Mother Tongue" optional>
            <Input {...form.register("mother_tongue")} />
          </Field>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border/60 p-5">
        <IconSectionHeader icon={Phone} title="Contact Information" />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Marital Status" optional>
            <Select
              value={maritalStatus || undefined}
              onValueChange={(v) =>
                form.setValue("marital_status", v, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {maritalStatusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Email Address"
            optional
            error={form.formState.errors.email?.message}
          >
            <Input
              type="email"
              placeholder="alex@university.edu"
              {...form.register("email")}
            />
          </Field>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Mobile Number
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="+1"
                className="w-16 shrink-0 px-3 text-center"
                {...form.register("mobile_country_code")}
              />
              <Input
                placeholder="000-000-0000"
                className="flex-1"
                {...form.register("mobile_number")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              WhatsApp Number (optional)
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="+1"
                className="w-16 shrink-0 px-3 text-center"
                {...form.register("whatsapp_country_code")}
              />
              <Input
                placeholder="000-000-0000"
                className="flex-1"
                {...form.register("whatsapp_number")}
              />
            </div>
          </div>
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
