"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@/lib/zod-resolver";
import { cn } from "@/lib/utils";
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
import {
  useCourseCatalogue,
  useStartApplication,
} from "@/hooks/use-application";
import { useCountries, useStatesOfCountry } from "@/hooks/use-geo";

const INDIA_COUNTRY_CODE = "IN";

const startApplicationSchema = z
  .object({
    course_id: z.string().trim().min(1, "Select a course"),
    is_indian_citizen: z.boolean(),
    state_of_domicile: z.string().trim().optional(),
    passport_country: z.string().trim().optional(),
    passport_number: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.is_indian_citizen) {
      if (!data.state_of_domicile) {
        ctx.addIssue({
          code: "custom",
          message: "State of domicile is required",
          path: ["state_of_domicile"],
        });
      }
    } else {
      if (!data.passport_country) {
        ctx.addIssue({
          code: "custom",
          message: "Country of origin is required",
          path: ["passport_country"],
        });
      }
      if (!data.passport_number) {
        ctx.addIssue({
          code: "custom",
          message: "Passport number is required",
          path: ["passport_number"],
        });
      }
    }
  });

type StartApplicationFormInput = z.infer<typeof startApplicationSchema>;

interface StartApplicationFormProps {
  cycleId: string;
  subdomain: string;
}

export function StartApplicationForm({
  cycleId,
  subdomain,
}: StartApplicationFormProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: courses, isLoading: coursesLoading } = useCourseCatalogue(
    cycleId,
    search || undefined,
    true,
  );
  const { mutate: start, isPending: isStarting } = useStartApplication(cycleId);

  const form = useForm<StartApplicationFormInput>({
    resolver: zodResolver(startApplicationSchema),
    defaultValues: {
      course_id: "",
      is_indian_citizen: true,
      state_of_domicile: "",
      passport_country: "",
      passport_number: "",
    },
  });

  const selectedCourseId = useWatch({
    control: form.control,
    name: "course_id",
  });
  const isIndianCitizen = useWatch({
    control: form.control,
    name: "is_indian_citizen",
  });

  const { data: countries, isLoading: countriesLoading } = useCountries();
  const { data: indianStates, isLoading: statesLoading } = useStatesOfCountry(
    INDIA_COUNTRY_CODE,
    isIndianCitizen,
  );

  function onSubmit(data: StartApplicationFormInput) {
    start(
      {
        nationality: data.is_indian_citizen ? "Indian" : "Other",
        course_id: data.course_id,
        state_of_domicile: data.is_indian_citizen
          ? data.state_of_domicile || undefined
          : undefined,
        passport_country: data.is_indian_citizen
          ? undefined
          : data.passport_country || undefined,
        passport_number: data.is_indian_citizen
          ? undefined
          : data.passport_number || undefined,
      },
      {
        onSuccess: (application) => {
          toast.success("Application started");
          router.push(`/college/${subdomain}/applications/${application.id}`);
        },
      },
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-4 rounded-2xl border border-border/60 bg-background p-5"
    >
      <Field label="Course" error={form.formState.errors.course_id?.message}>
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Field>

      <div className="max-h-72 space-y-2 overflow-y-auto">
        {coursesLoading ? (
          <p className="text-sm text-muted-foreground">Loading courses…</p>
        ) : (courses ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No courses found.</p>
        ) : (
          (courses ?? []).map((course) => {
            const isSelected = selectedCourseId === course.courseId;
            return (
              <div
                key={course.courseId}
                role="button"
                tabIndex={0}
                onClick={() =>
                  form.setValue("course_id", course.courseId, {
                    shouldValidate: true,
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    form.setValue("course_id", course.courseId, {
                      shouldValidate: true,
                    });
                  }
                }}
                className={cn(
                  "cursor-pointer rounded-xl p-3 text-sm transition-colors",
                  isSelected
                    ? "bg-headerTeal/10 ring-1 ring-headerTeal-dark"
                    : "bg-field hover:bg-field-focus",
                )}
              >
                <div className="flex items-center justify-between">
                  <span>
                    <span className="font-medium">{course.courseName}</span>
                    <span className="ml-1.5 text-muted-foreground">
                      ({course.courseCode})
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-medium">
                    ₹{course.applicationFee}
                  </span>
                </div>

                {isSelected && course.quotaOptions.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {course.quotaOptions.map((quota) => (
                      <span
                        key={quota.courseQuotaSeatId}
                        className="rounded-full bg-field px-2.5 py-1 text-xs font-medium text-foreground"
                      >
                        {quota.quotaName}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <div className="space-y-4 rounded-xl border border-border/60 bg-background p-4">
        <h3 className="text-sm font-semibold">Nationality Details</h3>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">
            Are you an Indian citizen?
          </label>
          <div className="grid grid-cols-2 gap-1 rounded-full bg-field p-1">
            <button
              type="button"
              onClick={() =>
                form.setValue("is_indian_citizen", true, {
                  shouldValidate: true,
                })
              }
              className={cn(
                "h-9 rounded-full text-sm font-medium transition-colors",
                isIndianCitizen
                  ? "bg-headerTeal-dark text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() =>
                form.setValue("is_indian_citizen", false, {
                  shouldValidate: true,
                })
              }
              className={cn(
                "h-9 rounded-full text-sm font-medium transition-colors",
                !isIndianCitizen
                  ? "bg-headerTeal-dark text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              No
            </button>
          </div>
        </div>

        {isIndianCitizen ? (
          <Field
            label="State of Domicile"
            error={form.formState.errors.state_of_domicile?.message}
          >
            <Select
              value={form.watch("state_of_domicile")}
              onValueChange={(v) =>
                form.setValue("state_of_domicile", v, { shouldValidate: true })
              }
              disabled={statesLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    statesLoading ? "Loading states…" : "Select state"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(indianStates ?? []).map((state) => (
                  <SelectItem key={state.code} value={state.name}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : (
          <>
            <Field
              label="Country of Origin"
              error={form.formState.errors.passport_country?.message}
            >
              <Select
                value={form.watch("passport_country")}
                onValueChange={(v) =>
                  form.setValue("passport_country", v, {
                    shouldValidate: true,
                  })
                }
                disabled={countriesLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      countriesLoading ? "Loading countries…" : "Select country"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(countries ?? []).map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label="Passport Number"
              error={form.formState.errors.passport_number?.message}
            >
              <Input
                placeholder="Enter passport number"
                {...form.register("passport_number")}
              />
            </Field>
          </>
        )}
      </div>

      <Button
        type="submit"
        disabled={isStarting}
        className="h-11 w-full rounded-full border-0 bg-headerTeal-dark text-white hover:bg-headerTeal-dark/90"
      >
        {isStarting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Start Application
      </Button>
    </form>
  );
}
