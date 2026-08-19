"use client";

import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Award, ChevronDown, Loader2, Plus, Trash2 } from "lucide-react";
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
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { IconSectionHeader } from "@/components/ui/icon-section-header";
import { getErrorMessage } from "@/lib/api";
import { uploadApplicationDocumentFile } from "@/lib/services/application.service";
import { DocumentRow } from "@/components/applications/file-preview";
import {
  useFormDetails,
  useUpdateAchievementsDetails,
} from "@/hooks/use-application";

// Backend requires a fully-qualified URL (z.string().url()) for every one
// of these fields. Users routinely type bare domains ("linkedin.com/...")
// with no protocol, which .url() rejects — previously this failed
// validation completely silently (no error text was rendered anywhere
// near these fields), so Save appeared to do nothing. Auto-prepending
// https:// before validating fixes the common case instead of just
// reporting the error after the fact.
const optionalUrl = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    if (trimmed === "") return "";
    if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
    return trimmed;
  },
  z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
);

const internshipSchema = z.object({
  company_name: z.string().trim().min(1, "Required").max(255),
  role: z.string().trim().min(1, "Required").max(150),
  start_date: z.string().trim().max(30).optional(),
  end_date: z.string().trim().max(30).optional(),
  key_responsibilities: z.string().trim().max(2000).optional(),
});

const workExperienceSchema = z.object({
  company_name: z.string().trim().min(1, "Required").max(255),
  job_title: z.string().trim().max(150).optional(),
  industry: z.string().trim().max(100).optional(),
  employment_type: z.string().trim().max(50).optional(),
  total_experience: z.string().trim().max(50).optional(),
});

const languageSchema = z.object({
  language: z.string().trim().min(1, "Required").max(50),
  proficiency: z.string().trim().max(30).optional(),
});

const academicAwardSchema = z.object({
  title: z.string().trim().min(1, "Required").max(255),
  year: z.coerce.number().int().min(1950).max(2100).optional(),
  issuing_body: z.string().trim().max(255).optional(),
  proof_url: optionalUrl,
});

const sportsAchievementSchema = z.object({
  sport_name: z.string().trim().min(1, "Required").max(100),
  competition_level: z.string().trim().max(50).optional(),
  position_secured: z.string().trim().max(50).optional(),
  achievement_year: z.coerce.number().int().min(1950).max(2100).optional(),
  certificate_url: optionalUrl,
});

const artsCulturalSchema = z.object({
  category: z.string().trim().min(1, "Required").max(100),
  competition_name: z.string().trim().max(255).optional(),
  achievement_level: z.string().trim().max(50).optional(),
  position_secured: z.string().trim().max(50).optional(),
  certificate_url: optionalUrl,
});

const publicationSchema = z.object({
  title: z.string().trim().min(1, "Required").max(255),
  journal_publisher: z.string().trim().max(255).optional(),
  url: optionalUrl,
});

const patentSchema = z.object({
  title: z.string().trim().min(1, "Required").max(255),
  patent_number: z.string().trim().max(100).optional(),
  status: z.enum(["filed", "published", "granted"]),
  filing_date: z.string().trim().max(30).optional(),
  patent_office: z.string().trim().max(150).optional(),
  co_inventors: z.string().trim().max(500).optional(),
  document_url: optionalUrl,
});

const certificationSchema = z.object({
  name: z.string().trim().min(1, "Required").max(255),
  issuing_authority: z.string().trim().min(1, "Required").max(255),
  certification_id: z.string().trim().max(100).optional(),
  issue_date: z.string().trim().max(30).optional(),
  expiry_date: z.string().trim().max(30).optional(),
  verification_url: optionalUrl,
  certificate_url: optionalUrl,
});

const recommendationLetterSchema = z.object({
  document_url: z.string().trim().url("Upload a file"),
});

const innovationSchema = z.object({
  startup_name: z.string().trim().min(1, "Required").max(255),
  role: z.string().trim().max(100).optional(),
  contribution: z.string().trim().max(2000).optional(),
  incubation_support: z.string().trim().max(255).optional(),
  dpiit_registration_number: z.string().trim().max(100).optional(),
});

const volunteeringSchema = z.object({
  organization_name: z.string().trim().min(1, "Required").max(255),
  role: z.string().trim().max(150).optional(),
  start_date: z.string().trim().max(30).optional(),
  end_date: z.string().trim().max(30).optional(),
  description: z.string().trim().max(2000).optional(),
});

const achievementsSchema = z.object({
  internships: z.array(internshipSchema),
  has_work_experience: z.boolean(),
  work_experience: z.array(workExperienceSchema),
  languages: z.array(languageSchema),
  academic_awards: z.array(academicAwardSchema),
  sports_achievements: z.array(sportsAchievementSchema),
  arts_cultural_achievements: z.array(artsCulturalSchema),
  hobbies: z.array(z.object({ value: z.string().trim().max(50) })),
  other_interests: z.string().trim().max(1000).optional(),
  publications: z.array(publicationSchema),
  patents: z.array(patentSchema),
  professional_certifications: z.array(certificationSchema),
  portfolio_links: z.object({
    linkedin_url: optionalUrl,
    github_url: optionalUrl,
    researchgate_url: optionalUrl,
    google_scholar_url: optionalUrl,
    orcid_id: z.string().trim().max(255).optional(),
    personal_website_url: optionalUrl,
    behance_url: optionalUrl,
    dribbble_url: optionalUrl,
    kaggle_url: optionalUrl,
  }),
  recommendation_letters: z.array(recommendationLetterSchema),
  innovation_entrepreneurship: z.array(innovationSchema),
  volunteering: z.array(volunteeringSchema),
});

type AchievementsFormInput = z.infer<typeof achievementsSchema>;

interface AchievementsDetailsFormProps {
  applicationId: string;
  onSaved?: () => void;
}

const defaultValues: AchievementsFormInput = {
  internships: [],
  has_work_experience: false,
  work_experience: [],
  languages: [],
  academic_awards: [],
  sports_achievements: [],
  arts_cultural_achievements: [],
  hobbies: [],
  other_interests: "",
  publications: [],
  patents: [],
  professional_certifications: [],
  portfolio_links: {
    linkedin_url: "",
    github_url: "",
    researchgate_url: "",
    google_scholar_url: "",
    orcid_id: "",
    personal_website_url: "",
    behance_url: "",
    dribbble_url: "",
    kaggle_url: "",
  },
  recommendation_letters: [],
  innovation_entrepreneurship: [],
  volunteering: [],
};

// Prefill data from the backend uses `T | null` for optional fields; the
// form's own schema (and react-hook-form's inputs) use `T | undefined`.
// Converts one level of null -> undefined on every property so
// form.reset() type-checks and empty inputs render correctly.
type NullsToUndefined<T> = {
  [K in keyof T]: T[K] extends null
    ? undefined
    : T[K] extends infer U | null
      ? U | undefined
      : T[K];
};

function nullsToUndefined<T extends object>(obj: T): NullsToUndefined<T> {
  const result = { ...obj } as Record<string, unknown>;
  for (const key in result) {
    if (result[key] === null) {
      result[key] = undefined;
    }
  }
  return result as NullsToUndefined<T>;
}

const yesNoOptions = [
  { value: "yes" as const, label: "Yes" },
  { value: "no" as const, label: "No" },
];

function AccordionSection({
  icon: Icon,
  title,
  children,
  defaultOpen,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="rounded-2xl border border-border/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-accentOrange" />
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? <div className="space-y-3 p-4 pt-0">{children}</div> : null}
    </div>
  );
}

function RemovableCard({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/40 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-field hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

// Supports GET prefill (achievements_details IS in the backend's readable
// section list, unlike the academic-records screens). Every field/section
// here is optional and submitted together in one PATCH — the backend does
// a full-column overwrite, not a merge, so this stays one shared form/
// submit rather than independently-submitting sub-forms (splitting would
// silently blank out sections not included in whichever partial PATCH ran).
export function AchievementsDetailsForm({
  applicationId,
  onSaved,
}: AchievementsDetailsFormProps) {
  const { data: existing, isLoading } = useFormDetails(
    applicationId,
    "achievements_details",
    true,
  );
  const { mutate: save, isPending } =
    useUpdateAchievementsDetails(applicationId);

  const form = useForm<AchievementsFormInput>({
    resolver: zodResolver(achievementsSchema),
    defaultValues,
  });

  const internships = useFieldArray({
    control: form.control,
    name: "internships",
  });
  const workExperience = useFieldArray({
    control: form.control,
    name: "work_experience",
  });
  const languages = useFieldArray({ control: form.control, name: "languages" });
  const academicAwards = useFieldArray({
    control: form.control,
    name: "academic_awards",
  });
  const sportsAchievements = useFieldArray({
    control: form.control,
    name: "sports_achievements",
  });
  const artsCultural = useFieldArray({
    control: form.control,
    name: "arts_cultural_achievements",
  });
  const hobbies = useFieldArray({ control: form.control, name: "hobbies" });
  const publications = useFieldArray({
    control: form.control,
    name: "publications",
  });
  const patents = useFieldArray({ control: form.control, name: "patents" });
  const certifications = useFieldArray({
    control: form.control,
    name: "professional_certifications",
  });
  const recommendationLetters = useFieldArray({
    control: form.control,
    name: "recommendation_letters",
  });
  const innovations = useFieldArray({
    control: form.control,
    name: "innovation_entrepreneurship",
  });
  const volunteering = useFieldArray({
    control: form.control,
    name: "volunteering",
  });

  const hasWorkExperience = useWatch({
    control: form.control,
    name: "has_work_experience",
  });

  useEffect(() => {
    if (!existing) return;
    form.reset({
      internships: (existing.internships ?? []).map(nullsToUndefined),
      has_work_experience: existing.has_work_experience ?? false,
      work_experience: (existing.work_experience ?? []).map(nullsToUndefined),
      languages: (existing.languages ?? []).map(nullsToUndefined),
      academic_awards: (existing.academic_awards ?? []).map(nullsToUndefined),
      sports_achievements: (existing.sports_achievements ?? []).map(
        nullsToUndefined,
      ),
      arts_cultural_achievements: (
        existing.arts_cultural_achievements ?? []
      ).map(nullsToUndefined),
      hobbies: (existing.hobbies ?? []).map((value) => ({ value })),
      other_interests: existing.other_interests ?? "",
      publications: (existing.publications ?? []).map(nullsToUndefined),
      patents: (existing.patents ?? []).map(nullsToUndefined),
      professional_certifications: (
        existing.professional_certifications ?? []
      ).map(nullsToUndefined),
      portfolio_links: nullsToUndefined({
        linkedin_url: existing.portfolio_links?.linkedin_url ?? "",
        github_url: existing.portfolio_links?.github_url ?? "",
        researchgate_url: existing.portfolio_links?.researchgate_url ?? "",
        google_scholar_url: existing.portfolio_links?.google_scholar_url ?? "",
        orcid_id: existing.portfolio_links?.orcid_id ?? "",
        personal_website_url:
          existing.portfolio_links?.personal_website_url ?? "",
        behance_url: existing.portfolio_links?.behance_url ?? "",
        dribbble_url: existing.portfolio_links?.dribbble_url ?? "",
        kaggle_url: existing.portfolio_links?.kaggle_url ?? "",
      }),
      recommendation_letters: (existing.recommendation_letters ?? []).map(
        nullsToUndefined,
      ),
      innovation_entrepreneurship: (
        existing.innovation_entrepreneurship ?? []
      ).map(nullsToUndefined),
      volunteering: (existing.volunteering ?? []).map(nullsToUndefined),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  async function handleRecommendationLetterUpload(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const uploaded = await uploadApplicationDocumentFile(file);
      recommendationLetters.append({ document_url: uploaded.url });
      toast.success("Recommendation letter added");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  function onSubmit(data: AchievementsFormInput) {
    save(
      {
        internships: data.internships,
        has_work_experience: data.has_work_experience,
        work_experience: data.has_work_experience ? data.work_experience : [],
        languages: data.languages,
        academic_awards: data.academic_awards,
        sports_achievements: data.sports_achievements,
        arts_cultural_achievements: data.arts_cultural_achievements,
        hobbies: data.hobbies.map((h) => h.value).filter(Boolean),
        other_interests: data.other_interests || undefined,
        publications: data.publications,
        patents: data.patents,
        professional_certifications: data.professional_certifications,
        portfolio_links: {
          linkedin_url: data.portfolio_links.linkedin_url || undefined,
          github_url: data.portfolio_links.github_url || undefined,
          researchgate_url: data.portfolio_links.researchgate_url || undefined,
          google_scholar_url:
            data.portfolio_links.google_scholar_url || undefined,
          orcid_id: data.portfolio_links.orcid_id || undefined,
          personal_website_url:
            data.portfolio_links.personal_website_url || undefined,
          behance_url: data.portfolio_links.behance_url || undefined,
          dribbble_url: data.portfolio_links.dribbble_url || undefined,
          kaggle_url: data.portfolio_links.kaggle_url || undefined,
        },
        recommendation_letters: data.recommendation_letters,
        innovation_entrepreneurship: data.innovation_entrepreneurship,
        volunteering: data.volunteering,
      },
      {
        onSuccess: () => {
          toast.success("Achievements saved");
          onSaved?.();
        },
      },
    );
  }

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-2xl border bg-muted" />;
  }

  // Some fields (e.g. URL fields nested many sections deep) don't have an
  // inline error message rendered next to them. Without this, an invalid
  // value there blocks the whole submit with zero visible feedback — the
  // Save button appears to "just do nothing". This guarantees a toast
  // fires whenever validation blocks submission, no matter which field.
  function onInvalid() {
    toast.error(
      "Some fields need attention before this can be saved — check the highlighted sections.",
    );
  }

  const hasErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, onInvalid)}
      noValidate
      className="space-y-3 rounded-2xl border border-border/60 p-5"
    >
      <IconSectionHeader
        icon={Award}
        title="Achievements & Extracurricular"
        subLabel="Optional Profile"
      />
      <p className="text-xs text-muted-foreground">
        Every section here is optional — fill in only what applies to you.
      </p>

      {hasErrors ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          One or more fields have an invalid value (e.g. a URL missing
          &ldquo;https://&rdquo;) — fix the highlighted field and try saving
          again.
        </p>
      ) : null}

      <AccordionSection icon={Award} title="Internships">
        {internships.fields.map((field, index) => (
          <RemovableCard
            key={field.id}
            title={`Internship ${index + 1}`}
            onRemove={() => internships.remove(index)}
          >
            <Field
              label="Company / Organization"
              error={
                form.formState.errors.internships?.[index]?.company_name
                  ?.message
              }
            >
              <Input {...form.register(`internships.${index}.company_name`)} />
            </Field>
            <Field
              label="Role / Position"
              error={form.formState.errors.internships?.[index]?.role?.message}
            >
              <Input {...form.register(`internships.${index}.role`)} />
            </Field>
            <Field label="Start date" optional>
              <Input {...form.register(`internships.${index}.start_date`)} />
            </Field>
            <Field label="End date" optional>
              <Input {...form.register(`internships.${index}.end_date`)} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Key responsibilities" optional>
                <Input
                  {...form.register(
                    `internships.${index}.key_responsibilities`,
                  )}
                />
              </Field>
            </div>
          </RemovableCard>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => internships.append({ company_name: "", role: "" })}
          className="rounded-full"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add internship
        </Button>
      </AccordionSection>

      <AccordionSection icon={Award} title="Work Experience">
        <div>
          <p className="mb-2 text-sm text-foreground">
            Do you have any work experience?
          </p>
          <SegmentedToggle
            options={yesNoOptions}
            value={hasWorkExperience ? "yes" : "no"}
            onChange={(v) =>
              form.setValue("has_work_experience", v === "yes", {
                shouldValidate: true,
              })
            }
            name="has_work_experience"
            className="max-w-xs"
          />
        </div>
        {hasWorkExperience ? (
          <>
            {workExperience.fields.map((field, index) => (
              <RemovableCard
                key={field.id}
                title={`Work Experience ${index + 1}`}
                onRemove={() => workExperience.remove(index)}
              >
                <Field
                  label="Company Name"
                  error={
                    form.formState.errors.work_experience?.[index]?.company_name
                      ?.message
                  }
                >
                  <Input
                    {...form.register(`work_experience.${index}.company_name`)}
                  />
                </Field>
                <Field label="Job Title" optional>
                  <Input
                    {...form.register(`work_experience.${index}.job_title`)}
                  />
                </Field>
                <Field label="Industry" optional>
                  <Input
                    {...form.register(`work_experience.${index}.industry`)}
                  />
                </Field>
                <Field label="Employment Type" optional>
                  <Input
                    {...form.register(
                      `work_experience.${index}.employment_type`,
                    )}
                  />
                </Field>
                <Field label="Total Experience" optional>
                  <Input
                    {...form.register(
                      `work_experience.${index}.total_experience`,
                    )}
                  />
                </Field>
              </RemovableCard>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => workExperience.append({ company_name: "" })}
              className="rounded-full"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add work experience
            </Button>
          </>
        ) : null}
      </AccordionSection>

      <AccordionSection icon={Award} title="Languages">
        {languages.fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <div className="grow">
              <Field
                label="Language"
                error={
                  form.formState.errors.languages?.[index]?.language?.message
                }
              >
                <Input {...form.register(`languages.${index}.language`)} />
              </Field>
            </div>
            <div className="grow">
              <Field label="Proficiency" optional>
                <Input {...form.register(`languages.${index}.proficiency`)} />
              </Field>
            </div>
            <button
              type="button"
              onClick={() => languages.remove(index)}
              className="mt-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-field hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => languages.append({ language: "" })}
          className="rounded-full"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add language
        </Button>
      </AccordionSection>

      <AccordionSection icon={Award} title="Academic Awards">
        {academicAwards.fields.map((field, index) => (
          <RemovableCard
            key={field.id}
            title={`Award ${index + 1}`}
            onRemove={() => academicAwards.remove(index)}
          >
            <Field
              label="Title"
              error={
                form.formState.errors.academic_awards?.[index]?.title?.message
              }
            >
              <Input {...form.register(`academic_awards.${index}.title`)} />
            </Field>
            <Field label="Year" optional>
              <Input
                type="number"
                {...form.register(`academic_awards.${index}.year`)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Issuing Body" optional>
                <Input
                  {...form.register(`academic_awards.${index}.issuing_body`)}
                />
              </Field>
            </div>
          </RemovableCard>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => academicAwards.append({ title: "" })}
          className="rounded-full"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add award
        </Button>
      </AccordionSection>

      <AccordionSection icon={Award} title="Sports Achievements">
        {sportsAchievements.fields.map((field, index) => (
          <RemovableCard
            key={field.id}
            title={`Achievement ${index + 1}`}
            onRemove={() => sportsAchievements.remove(index)}
          >
            <Field
              label="Sport Name"
              error={
                form.formState.errors.sports_achievements?.[index]?.sport_name
                  ?.message
              }
            >
              <Input
                {...form.register(`sports_achievements.${index}.sport_name`)}
              />
            </Field>
            <Field label="Competition Level" optional>
              <Input
                {...form.register(
                  `sports_achievements.${index}.competition_level`,
                )}
              />
            </Field>
            <Field label="Position Secured" optional>
              <Input
                {...form.register(
                  `sports_achievements.${index}.position_secured`,
                )}
              />
            </Field>
            <Field label="Year" optional>
              <Input
                type="number"
                {...form.register(
                  `sports_achievements.${index}.achievement_year`,
                )}
              />
            </Field>
          </RemovableCard>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => sportsAchievements.append({ sport_name: "" })}
          className="rounded-full"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add sports achievement
        </Button>
      </AccordionSection>

      <AccordionSection icon={Award} title="Arts & Cultural Achievements">
        {artsCultural.fields.map((field, index) => (
          <RemovableCard
            key={field.id}
            title={`Achievement ${index + 1}`}
            onRemove={() => artsCultural.remove(index)}
          >
            <Field
              label="Category"
              error={
                form.formState.errors.arts_cultural_achievements?.[index]
                  ?.category?.message
              }
            >
              <Input
                {...form.register(
                  `arts_cultural_achievements.${index}.category`,
                )}
              />
            </Field>
            <Field label="Competition Name" optional>
              <Input
                {...form.register(
                  `arts_cultural_achievements.${index}.competition_name`,
                )}
              />
            </Field>
            <Field label="Achievement Level" optional>
              <Input
                {...form.register(
                  `arts_cultural_achievements.${index}.achievement_level`,
                )}
              />
            </Field>
            <Field label="Position Secured" optional>
              <Input
                {...form.register(
                  `arts_cultural_achievements.${index}.position_secured`,
                )}
              />
            </Field>
          </RemovableCard>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => artsCultural.append({ category: "" })}
          className="rounded-full"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add arts / cultural
          achievement
        </Button>
      </AccordionSection>

      <AccordionSection icon={Award} title="Hobbies & Interests">
        <div className="flex flex-wrap gap-2">
          {hobbies.fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-1">
              <Input
                className="h-9 w-32"
                placeholder="Hobby"
                {...form.register(`hobbies.${index}.value`)}
              />
              <button
                type="button"
                onClick={() => hobbies.remove(index)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-field hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => hobbies.append({ value: "" })}
          className="rounded-full"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add hobby
        </Button>
        <textarea
          rows={2}
          className="w-full rounded-2xl border-0 bg-field px-5 py-3 text-sm text-foreground outline-none transition-colors focus:bg-field-focus focus-visible:ring-2 focus-visible:ring-accentOrange/40"
          placeholder="Other interests"
          {...form.register("other_interests")}
        />
      </AccordionSection>

      <AccordionSection icon={Award} title="Publications">
        {publications.fields.map((field, index) => (
          <RemovableCard
            key={field.id}
            title={`Publication ${index + 1}`}
            onRemove={() => publications.remove(index)}
          >
            <div className="sm:col-span-2">
              <Field
                label="Title"
                error={
                  form.formState.errors.publications?.[index]?.title?.message
                }
              >
                <Input {...form.register(`publications.${index}.title`)} />
              </Field>
            </div>
            <Field label="Journal / Publisher" optional>
              <Input
                {...form.register(`publications.${index}.journal_publisher`)}
              />
            </Field>
            <Field
              label="URL"
              optional
              error={form.formState.errors.publications?.[index]?.url?.message}
            >
              <Input {...form.register(`publications.${index}.url`)} />
            </Field>
          </RemovableCard>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => publications.append({ title: "" })}
          className="rounded-full"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add publication
        </Button>
      </AccordionSection>

      <AccordionSection icon={Award} title="Patent Details">
        {patents.fields.map((field, index) => (
          <RemovableCard
            key={field.id}
            title={`Patent ${index + 1}`}
            onRemove={() => patents.remove(index)}
          >
            <div className="sm:col-span-2">
              <Field
                label="Title"
                error={form.formState.errors.patents?.[index]?.title?.message}
              >
                <Input {...form.register(`patents.${index}.title`)} />
              </Field>
            </div>
            <Field label="Patent Number" optional>
              <Input {...form.register(`patents.${index}.patent_number`)} />
            </Field>
            <Field label="Status">
              <PatentStatusSelect form={form} index={index} />
            </Field>
            <Field label="Filing Date" optional>
              <Input {...form.register(`patents.${index}.filing_date`)} />
            </Field>
            <Field label="Patent Office" optional>
              <Input {...form.register(`patents.${index}.patent_office`)} />
            </Field>
          </RemovableCard>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => patents.append({ title: "", status: "filed" })}
          className="rounded-full"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add patent
        </Button>
      </AccordionSection>

      <AccordionSection icon={Award} title="Professional Certifications">
        {certifications.fields.map((field, index) => (
          <RemovableCard
            key={field.id}
            title={`Certification ${index + 1}`}
            onRemove={() => certifications.remove(index)}
          >
            <Field
              label="Name"
              error={
                form.formState.errors.professional_certifications?.[index]?.name
                  ?.message
              }
            >
              <Input
                {...form.register(`professional_certifications.${index}.name`)}
              />
            </Field>
            <Field
              label="Issuing Authority"
              error={
                form.formState.errors.professional_certifications?.[index]
                  ?.issuing_authority?.message
              }
            >
              <Input
                {...form.register(
                  `professional_certifications.${index}.issuing_authority`,
                )}
              />
            </Field>
            <Field label="Issue Date" optional>
              <Input
                {...form.register(
                  `professional_certifications.${index}.issue_date`,
                )}
              />
            </Field>
            <Field label="Expiry Date" optional>
              <Input
                {...form.register(
                  `professional_certifications.${index}.expiry_date`,
                )}
              />
            </Field>
          </RemovableCard>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            certifications.append({ name: "", issuing_authority: "" })
          }
          className="rounded-full"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add certification
        </Button>
      </AccordionSection>

      <AccordionSection icon={Award} title="Portfolio & Profile Links">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="LinkedIn Profile"
            optional
            error={form.formState.errors.portfolio_links?.linkedin_url?.message}
          >
            <Input {...form.register("portfolio_links.linkedin_url")} />
          </Field>
          <Field
            label="GitHub Profile"
            optional
            error={form.formState.errors.portfolio_links?.github_url?.message}
          >
            <Input {...form.register("portfolio_links.github_url")} />
          </Field>
          <Field
            label="ResearchGate Profile"
            optional
            error={
              form.formState.errors.portfolio_links?.researchgate_url?.message
            }
          >
            <Input {...form.register("portfolio_links.researchgate_url")} />
          </Field>
          <Field
            label="Google Scholar Profile"
            optional
            error={
              form.formState.errors.portfolio_links?.google_scholar_url?.message
            }
          >
            <Input {...form.register("portfolio_links.google_scholar_url")} />
          </Field>
          <Field label="ORCID iD" optional>
            <Input {...form.register("portfolio_links.orcid_id")} />
          </Field>
          <Field
            label="Personal / Portfolio Website"
            optional
            error={
              form.formState.errors.portfolio_links?.personal_website_url
                ?.message
            }
          >
            <Input {...form.register("portfolio_links.personal_website_url")} />
          </Field>
          <Field
            label="Behance Profile"
            optional
            error={form.formState.errors.portfolio_links?.behance_url?.message}
          >
            <Input {...form.register("portfolio_links.behance_url")} />
          </Field>
          <Field
            label="Dribbble Profile"
            optional
            error={form.formState.errors.portfolio_links?.dribbble_url?.message}
          >
            <Input {...form.register("portfolio_links.dribbble_url")} />
          </Field>
          <Field
            label="Kaggle Profile"
            optional
            error={form.formState.errors.portfolio_links?.kaggle_url?.message}
          >
            <Input {...form.register("portfolio_links.kaggle_url")} />
          </Field>
        </div>
      </AccordionSection>

      <AccordionSection icon={Award} title="Letter of Recommendation">
        <div className="space-y-2">
          {recommendationLetters.fields.map((field, index) => (
            <DocumentRow
              key={field.id}
              fileName={`Letter ${index + 1}`}
              fileUrl={field.document_url}
              onRemove={() => recommendationLetters.remove(index)}
            />
          ))}
        </div>
        <RecommendationLetterUpload
          onUpload={handleRecommendationLetterUpload}
        />
      </AccordionSection>

      <AccordionSection icon={Award} title="Innovation & Entrepreneurship">
        {innovations.fields.map((field, index) => (
          <RemovableCard
            key={field.id}
            title={`Entry ${index + 1}`}
            onRemove={() => innovations.remove(index)}
          >
            <Field
              label="Startup Name"
              error={
                form.formState.errors.innovation_entrepreneurship?.[index]
                  ?.startup_name?.message
              }
            >
              <Input
                {...form.register(
                  `innovation_entrepreneurship.${index}.startup_name`,
                )}
              />
            </Field>
            <Field label="Role" optional>
              <Input
                {...form.register(`innovation_entrepreneurship.${index}.role`)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Contribution" optional>
                <Input
                  {...form.register(
                    `innovation_entrepreneurship.${index}.contribution`,
                  )}
                />
              </Field>
            </div>
            <Field label="Incubation Support" optional>
              <Input
                {...form.register(
                  `innovation_entrepreneurship.${index}.incubation_support`,
                )}
              />
            </Field>
            <Field label="DPIIT Registration Number" optional>
              <Input
                {...form.register(
                  `innovation_entrepreneurship.${index}.dpiit_registration_number`,
                )}
              />
            </Field>
          </RemovableCard>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => innovations.append({ startup_name: "" })}
          className="rounded-full"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add entry
        </Button>
      </AccordionSection>

      <AccordionSection icon={Award} title="Volunteering & Social Service">
        {volunteering.fields.map((field, index) => (
          <RemovableCard
            key={field.id}
            title={`Entry ${index + 1}`}
            onRemove={() => volunteering.remove(index)}
          >
            <Field
              label="Organization Name"
              error={
                form.formState.errors.volunteering?.[index]?.organization_name
                  ?.message
              }
            >
              <Input
                {...form.register(`volunteering.${index}.organization_name`)}
              />
            </Field>
            <Field label="Role" optional>
              <Input {...form.register(`volunteering.${index}.role`)} />
            </Field>
            <Field label="Start Date" optional>
              <Input {...form.register(`volunteering.${index}.start_date`)} />
            </Field>
            <Field label="End Date" optional>
              <Input {...form.register(`volunteering.${index}.end_date`)} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description" optional>
                <Input
                  {...form.register(`volunteering.${index}.description`)}
                />
              </Field>
            </div>
          </RemovableCard>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => volunteering.append({ organization_name: "" })}
          className="rounded-full"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add volunteering entry
        </Button>
      </AccordionSection>

      <Button
        type="submit"
        disabled={isPending}
        className="h-14 w-full rounded-full border-0 bg-gradient-to-r from-[hsl(var(--accent-orange-gradient-from))] to-[hsl(var(--accent-orange-gradient-to))] text-base font-semibold text-accentOrange-foreground shadow-md hover:opacity-95"
      >
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save Achievements
      </Button>
    </form>
  );
}

function PatentStatusSelect({
  form,
  index,
}: {
  form: ReturnType<typeof useForm<AchievementsFormInput>>;
  index: number;
}) {
  const status = useWatch({
    control: form.control,
    name: `patents.${index}.status`,
  });
  return (
    <Select
      value={status}
      onValueChange={(v) =>
        form.setValue(
          `patents.${index}.status`,
          v as "filed" | "published" | "granted",
          { shouldValidate: true },
        )
      }
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="filed">Filed</SelectItem>
        <SelectItem value="published">Published</SelectItem>
        <SelectItem value="granted">Granted</SelectItem>
      </SelectContent>
    </Select>
  );
}

function RecommendationLetterUpload({
  onUpload,
}: {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={onUpload}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={() => fileInputRef.current?.click()}
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Add recommendation letter
      </Button>
    </>
  );
}
