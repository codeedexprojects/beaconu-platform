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

const inputCls =
  "h-11 w-full rounded-xl border border-border/60 bg-background px-3.5 text-sm outline-none focus:border-foreground/30";

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
      className="space-y-4 rounded-2xl border border-border/60 p-5"
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Course</label>
        <input
          className={inputCls}
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="mt-2 max-h-72 space-y-2 overflow-y-auto">
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
                    "cursor-pointer rounded-xl border p-3 text-sm",
                    isSelected
                      ? "border-primary ring-1 ring-primary"
                      : "border-border/60",
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
                          className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
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
        {form.formState.errors.course_id ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.course_id.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-4 rounded-xl border border-border/60 p-4">
        <h3 className="text-sm font-semibold">Nationality Details</h3>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">
            Are you an Indian citizen?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                form.setValue("is_indian_citizen", true, {
                  shouldValidate: true,
                })
              }
              className={cn(
                "h-11 rounded-xl text-sm font-medium transition-colors",
                isIndianCitizen
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/60 text-muted-foreground",
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
                "h-11 rounded-xl text-sm font-medium transition-colors",
                !isIndianCitizen
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/60 text-muted-foreground",
              )}
            >
              No
            </button>
          </div>
        </div>

        {isIndianCitizen ? (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">State of Domicile</label>
            <select
              className={inputCls}
              disabled={statesLoading}
              {...form.register("state_of_domicile")}
            >
              <option value="">
                {statesLoading ? "Loading states…" : "Select state"}
              </option>
              {(indianStates ?? []).map((state) => (
                <option key={state.code} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
            {form.formState.errors.state_of_domicile ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.state_of_domicile.message}
              </p>
            ) : null}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Country of Origin</label>
              <select
                className={inputCls}
                disabled={countriesLoading}
                {...form.register("passport_country")}
              >
                <option value="">
                  {countriesLoading ? "Loading countries…" : "Select country"}
                </option>
                {(countries ?? []).map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.passport_country ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.passport_country.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Passport Number</label>
              <input
                className={inputCls}
                placeholder="Enter passport number"
                {...form.register("passport_number")}
              />
              {form.formState.errors.passport_number ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.passport_number.message}
                </p>
              ) : null}
            </div>
          </>
        )}
      </div>

      <Button type="submit" disabled={isStarting} className="h-11 w-full">
        {isStarting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Start Application
      </Button>
    </form>
  );
}
