"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CalendarDays, Loader2 } from "lucide-react";
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
  useAdmissionCycles,
  useCourseCatalogue,
  useStartApplication,
} from "@/hooks/use-application";
import { useCountries, useStatesOfCountry } from "@/hooks/use-geo";

const INDIA_COUNTRY_CODE = "IN";

const nationalitySchema = z
  .object({
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

type NationalityInput = z.infer<typeof nationalitySchema>;

type Step = "nationality" | "cycle" | "course";

interface StartApplicationFormProps {
  cycleId?: string;
  collegeId: string;
  subdomain: string;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function StepHeader({
  step,
  index,
  total,
}: {
  step: string;
  index: number;
  total: number;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-headerTeal">
        Step {index} of {total}
      </p>
      <h2 className="mt-1 text-lg font-semibold">{step}</h2>
    </div>
  );
}

export function StartApplicationForm({
  cycleId: initialCycleId,
  collegeId,
  subdomain,
}: StartApplicationFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("nationality");
  const [cycleId, setCycleId] = useState<string | undefined>(initialCycleId);
  const [search, setSearch] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const totalSteps = initialCycleId ? 2 : 3;
  const stepIndex =
    step === "nationality" ? 1 : step === "cycle" ? 2 : totalSteps;

  const form = useForm<NationalityInput>({
    resolver: zodResolver(nationalitySchema),
    defaultValues: {
      is_indian_citizen: true,
      state_of_domicile: "",
      passport_country: "",
      passport_number: "",
    },
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

  const { data: cycles, isLoading: cyclesLoading } = useAdmissionCycles(
    collegeId,
    step === "cycle",
  );
  const openCycles = (cycles ?? []).filter((c) => c.status === "open");

  const { data: courses, isLoading: coursesLoading } = useCourseCatalogue(
    cycleId ?? "",
    search || undefined,
    step === "course" && !!cycleId,
  );
  const { mutate: start, isPending: isStarting } = useStartApplication(
    cycleId ?? "",
  );

  function handleNationalityNext(data: NationalityInput) {
    setStep(initialCycleId ? "course" : "cycle");
    return data;
  }

  function handleCycleSelect(id: string) {
    setCycleId(id);
    setStep("course");
  }

  function handleCourseSubmit() {
    if (!selectedCourseId || !cycleId) return;
    const data = form.getValues();
    start(
      {
        nationality: data.is_indian_citizen ? "Indian" : "Other",
        course_id: selectedCourseId,
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
    <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-5">
      {step === "nationality" ? (
        <form
          onSubmit={form.handleSubmit(handleNationalityNext)}
          noValidate
          className="space-y-4"
        >
          <StepHeader
            step="Nationality Details"
            index={stepIndex}
            total={totalSteps}
          />

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
                  form.setValue("state_of_domicile", v, {
                    shouldValidate: true,
                  })
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
                        countriesLoading
                          ? "Loading countries…"
                          : "Select country"
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

          <Button
            type="submit"
            className="h-11 w-full rounded-full border-0 bg-headerTeal-dark text-white hover:bg-headerTeal-dark/90"
          >
            Continue
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </form>
      ) : null}

      {step === "cycle" ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep("nationality")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-field hover:text-foreground"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <StepHeader
              step="Choose Admission Cycle"
              index={stepIndex}
              total={totalSteps}
            />
          </div>

          {cyclesLoading ? (
            <p className="text-sm text-muted-foreground">Loading cycles…</p>
          ) : openCycles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              There are no admission cycles open right now.
            </p>
          ) : (
            <div className="space-y-2.5">
              {openCycles.map((cycle) => (
                <button
                  key={cycle.id}
                  type="button"
                  onClick={() => handleCycleSelect(cycle.id)}
                  className="w-full rounded-xl bg-field p-4 text-left transition-colors hover:bg-field-focus"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                      {formatLabel(cycle.programLevel)}
                    </span>
                    <span className="rounded-full bg-headerTeal-dark px-2.5 py-1 text-xs font-medium text-white">
                      Open
                    </span>
                  </div>
                  <p className="mt-2 font-semibold">{cycle.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatLabel(cycle.applicationType)} · {cycle.admissionYear}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>
                      {formatDate(cycle.startsOn)} – {formatDate(cycle.endsOn)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {step === "course" ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(initialCycleId ? "nationality" : "cycle")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-field hover:text-foreground"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <StepHeader
              step="Choose Course"
              index={stepIndex}
              total={totalSteps}
            />
          </div>

          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

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
                    onClick={() => setSelectedCourseId(course.courseId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedCourseId(course.courseId);
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

          <Button
            type="button"
            disabled={!selectedCourseId || isStarting}
            onClick={handleCourseSubmit}
            className="h-11 w-full rounded-full border-0 bg-headerTeal-dark text-white hover:bg-headerTeal-dark/90"
          >
            {isStarting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Start Application
          </Button>
        </div>
      ) : null}
    </div>
  );
}
