"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, MapPin } from "lucide-react";
import { zodResolver } from "@/lib/zod-resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { IconSectionHeader } from "@/components/ui/icon-section-header";
import {
  useFormDetails,
  useUpdateAddressDetails,
} from "@/hooks/use-application";

const addressBlockSchema = z.object({
  address_line1: z.string().trim().min(1, "Address is required").max(255),
  address_line2: z.string().trim().max(255).optional(),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().min(1, "State is required").max(100),
  district: z.string().trim().max(100).optional(),
  pin_code: z.string().trim().min(1, "PIN code is required").max(10),
  country: z.string().trim().min(1, "Country is required").max(100),
});

const looseAddressBlockSchema = z.object({
  address_line1: z.string().trim().max(255),
  address_line2: z.string().trim().max(255).optional(),
  city: z.string().trim().max(100),
  state: z.string().trim().max(100),
  district: z.string().trim().max(100).optional(),
  pin_code: z.string().trim().max(10),
  country: z.string().trim().max(100),
});

// Correspondence is the always-required address; permanent is optional-if-
// same, per the backend's correspondence/same_as_correspondence/permanent
// shape (backend renamed and inverted this from the old permanent/current
// shape — see application-details.validator.ts).
const addressDetailsSchema = z
  .object({
    correspondence: addressBlockSchema,
    same_as_correspondence: z.boolean(),
    permanent: looseAddressBlockSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.same_as_correspondence) return;
    const permanent = data.permanent;
    if (!permanent || permanent.address_line1.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Address is required",
        path: ["permanent", "address_line1"],
      });
    }
    if (!permanent || permanent.city.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "City is required",
        path: ["permanent", "city"],
      });
    }
    if (!permanent || permanent.state.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "State is required",
        path: ["permanent", "state"],
      });
    }
    if (!permanent || permanent.pin_code.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "PIN code is required",
        path: ["permanent", "pin_code"],
      });
    }
    if (!permanent || permanent.country.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Country is required",
        path: ["permanent", "country"],
      });
    }
  });

type AddressDetailsFormInput = z.infer<typeof addressDetailsSchema>;

interface AddressDetailsFormProps {
  applicationId: string;
  onSaved?: () => void;
}

const emptyAddress = {
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  district: "",
  pin_code: "",
  country: "",
};

function normalizeAddress(
  block:
    | Partial<{
        address_line1: string;
        address_line2: string | null;
        city: string;
        state: string;
        district: string | null;
        pin_code: string;
        country: string;
      }>
    | null
    | undefined,
) {
  return {
    address_line1: block?.address_line1 ?? "",
    address_line2: block?.address_line2 ?? "",
    city: block?.city ?? "",
    state: block?.state ?? "",
    district: block?.district ?? "",
    pin_code: block?.pin_code ?? "",
    country: block?.country ?? "",
  };
}

function AddressFields({
  form,
  prefix,
}: {
  form: ReturnType<typeof useForm<AddressDetailsFormInput>>;
  prefix: "correspondence" | "permanent";
}) {
  const errors = form.formState.errors[prefix];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Address Line 1" error={errors?.address_line1?.message}>
          <Input {...form.register(`${prefix}.address_line1`)} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Address Line 2" optional>
          <Input {...form.register(`${prefix}.address_line2`)} />
        </Field>
      </div>
      <Field label="City" error={errors?.city?.message}>
        <Input {...form.register(`${prefix}.city`)} />
      </Field>
      <Field label="State" error={errors?.state?.message}>
        <Input {...form.register(`${prefix}.state`)} />
      </Field>
      <Field label="District" optional>
        <Input {...form.register(`${prefix}.district`)} />
      </Field>
      <Field label="PIN Code" error={errors?.pin_code?.message}>
        <Input {...form.register(`${prefix}.pin_code`)} />
      </Field>
      <Field label="Country" error={errors?.country?.message}>
        <Input {...form.register(`${prefix}.country`)} />
      </Field>
    </div>
  );
}

export function AddressDetailsForm({
  applicationId,
  onSaved,
}: AddressDetailsFormProps) {
  const { data: existing, isLoading } = useFormDetails(
    applicationId,
    "address_details",
    true,
  );
  const { mutate: save, isPending } = useUpdateAddressDetails(applicationId);

  const form = useForm<AddressDetailsFormInput>({
    resolver: zodResolver(addressDetailsSchema),
    defaultValues: {
      correspondence: emptyAddress,
      same_as_correspondence: true,
      permanent: emptyAddress,
    },
  });

  const sameAsCorrespondence = useWatch({
    control: form.control,
    name: "same_as_correspondence",
  });

  useEffect(() => {
    if (!existing) return;
    form.reset({
      correspondence: normalizeAddress(existing.correspondence),
      same_as_correspondence: existing.same_as_correspondence ?? true,
      permanent: normalizeAddress(existing.permanent),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  function onSubmit(data: AddressDetailsFormInput) {
    save(
      {
        correspondence: {
          ...data.correspondence,
          address_line2: data.correspondence.address_line2 || undefined,
          district: data.correspondence.district || undefined,
        },
        same_as_correspondence: data.same_as_correspondence,
        permanent: data.same_as_correspondence
          ? undefined
          : data.permanent
            ? {
                ...data.permanent,
                address_line2: data.permanent.address_line2 || undefined,
                district: data.permanent.district || undefined,
              }
            : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Address details saved");
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
      className="space-y-6 rounded-2xl border border-border/60 bg-background p-5"
    >
      <IconSectionHeader
        icon={MapPin}
        title="Address Details"
        subLabel="Correspondence Address"
      />
      <AddressFields form={form} prefix="correspondence" />

      <label className="flex items-center gap-2 text-sm text-foreground">
        <Checkbox {...form.register("same_as_correspondence")} />
        Permanent address is the same as correspondence address
      </label>

      {!sameAsCorrespondence ? (
        <div>
          <IconSectionHeader
            icon={MapPin}
            title="Permanent Address"
            subLabel="Permanent Address"
            className="mb-3"
          />
          <AddressFields form={form} prefix="permanent" />
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isPending}
        className="h-14 w-full rounded-full border-0 bg-headerTeal-dark text-base font-semibold text-white shadow-md hover:opacity-95"
      >
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save & Continue
      </Button>
    </form>
  );
}
