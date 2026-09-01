"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Plus, Trash2, ListChecks } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const summaryStatSchema = z.object({
  label: z.string().min(1, "Label is required"),
  value: z.string().optional(),
  unit: z.string().optional(),
});

const notableOfferSchema = z.object({
  id: z.string().optional(),
  company_name: z.string().min(1, "Company name is required"),
  company_logo: z.string().optional(),
  company_initial: z.string().optional(),
  role: z.string().optional(),
  package: z.string().optional(),
  unit: z.string().optional(),
  package_label: z.string().optional(),
  badge: z.string().optional(),
  category: z.string().optional(),
});

const notableOffersSchema = z.object({
  title: z.string().optional(),
  items: z.array(notableOfferSchema).optional(),
});

const trendDataPointSchema = z.object({
  year: z.string().min(1, "Year is required"),
  avg_package: z.string().optional(),
  highlighted: z.boolean().optional(),
});

const placementTrendsSchema = z.object({
  title: z.string().optional(),
  duration_filter: z.string().optional(),
  footer: z
    .object({
      label: z.string().optional(),
      value: z.string().optional(),
    })
    .optional(),
  data_points: z.array(trendDataPointSchema).optional(),
});

const companyStatRowSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  company_initial: z.string().optional(),
  company_logo: z.string().optional(),
  avg_package: z.string().optional(),
  max_package: z.string().optional(),
  students_placed: z.string().optional(),
  progress_percentage: z.string().optional(),
});

const allCompanyStatisticsSchema = z.object({
  title: z.string().optional(),
  rows: z.array(companyStatRowSchema).optional(),
});

const industryRowSchema = z.object({
  industry: z.string().min(1, "Industry is required"),
  subtitle: z.string().optional(),
  avg_package: z.string().optional(),
  max_package: z.string().optional(),
  students_placed: z.string().optional(),
  progress_percentage: z.string().optional(),
});

const industrySalaryReportSchema = z.object({
  title: z.string().optional(),
  rows: z.array(industryRowSchema).optional(),
});

const successStorySchema = z.object({
  student_name: z.string().min(1, "Student name is required"),
  student_avatar: z.string().optional(),
  placed_at: z.string().optional(),
  quote: z.string().optional(),
  type: z.enum(["youtube", "mp4"]).optional(),
  thumbnail: z.string().optional(),
  video_url: z.string().optional(),
});

const studentSuccessSchema = z.object({
  title: z.string().optional(),
  items: z.array(successStorySchema).optional(),
});

const downloadReportSchema = z.object({
  url: z.string().optional(),
  label: z.string().optional(),
});

const placementsTabSchema = z.object({
  title: z.string().optional(),
  enabled: z.boolean().optional(),
  summary_stats: z.array(summaryStatSchema).optional(),
  notable_offers: notableOffersSchema.optional(),
  placement_trends: placementTrendsSchema.optional(),
  all_company_statistics: allCompanyStatisticsSchema.optional(),
  industry_salary_report: industrySalaryReportSchema.optional(),
  student_success: studentSuccessSchema.optional(),
  download_report: downloadReportSchema.optional(),
});

type PlacementsTabData = z.infer<typeof placementsTabSchema>;

// Blocks the "Add" button while the last item's required field is empty.
function isLastItemIncomplete(items: any[], ...fields: string[]): boolean {
  if (!items || items.length === 0) return false;
  const last = items[items.length - 1];
  return fields.some((f) => !String(last?.[f] ?? "").trim());
}

function PlacementsEmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 py-8 text-center">
      <ListChecks className="h-6 w-6 text-muted-foreground/40" />
      <span className="text-xs text-muted-foreground max-w-xs">
        No {label} yet — click above to add your first one.
      </span>
    </div>
  );
}

type DeleteArray =
  | "summary_stats"
  | "notable_offers"
  | "trend_points"
  | "company_stats"
  | "industry_rows"
  | "success_stories";

export function PlacementsTab({
  payload,
  onChange,
  uploadingField,
  onFieldUpload,
}: {
  payload: any;
  onChange: (updates: any) => void;
  uploadingField: string | null;
  onFieldUpload: (
    file: File | null,
    fieldKey: string,
    s3PathSuffix: string,
    onSuccess: (url: string) => void,
  ) => void;
}) {
  const [deleteTarget, setDeleteTarget] = useState<{
    array: DeleteArray;
    index: number;
  } | null>(null);

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PlacementsTabData>({
    resolver: zodResolver(placementsTabSchema as any),
    values: payload,
  });

  const summaryStatsArray = useFieldArray({
    control: control as any,
    name: "summary_stats",
  });
  const notableOffersArray = useFieldArray({
    control: control as any,
    name: "notable_offers.items",
  });
  const trendPointsArray = useFieldArray({
    control: control as any,
    name: "placement_trends.data_points",
  });
  const companyStatsArray = useFieldArray({
    control: control as any,
    name: "all_company_statistics.rows",
  });
  const industryRowsArray = useFieldArray({
    control: control as any,
    name: "industry_salary_report.rows",
  });
  const successStoriesArray = useFieldArray({
    control: control as any,
    name: "student_success.items",
  });

  const watchedSummaryStats = watch("summary_stats") || [];
  const watchedNotableOffers = watch("notable_offers.items") || [];
  const watchedTrendPoints = watch("placement_trends.data_points") || [];
  const watchedCompanyStats = watch("all_company_statistics.rows") || [];
  const watchedIndustryRows = watch("industry_salary_report.rows") || [];
  const watchedSuccessStories = watch("student_success.items") || [];

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Section Title</Label>
          <Input placeholder="e.g. Placements" {...register("title")} />
        </div>
        <div className="flex items-center gap-3 pt-5">
          <Label className="text-xs">Enabled</Label>
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={watch("enabled") ?? true}
            onChange={(e) => setValue("enabled", e.target.checked)}
          />
        </div>
      </div>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Summary Stats</CardTitle>
            <CardDescription>
              Key placement numbers shown at the top (e.g. Average Package,
              Highest Package).
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedSummaryStats, "label")}
            onClick={() =>
              summaryStatsArray.append({ label: "", value: "", unit: "" })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Stat
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {summaryStatsArray.fields.length === 0 ? (
            <PlacementsEmptyState label="stats" />
          ) : (
            <div className="space-y-3">
              {summaryStatsArray.fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="border rounded-lg p-3 space-y-2 bg-muted/5"
                >
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input
                        placeholder="e.g. Average Package"
                        {...register(`summary_stats.${idx}.label`)}
                      />
                      {errors.summary_stats?.[idx]?.label && (
                        <p className="text-xs text-destructive">
                          {errors.summary_stats[idx]?.label?.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Value</Label>
                      <Input
                        placeholder="e.g. 4.2"
                        {...register(`summary_stats.${idx}.value`)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Unit</Label>
                      <Input
                        placeholder="e.g. LPA"
                        {...register(`summary_stats.${idx}.unit`)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setDeleteTarget({
                            array: "summary_stats",
                            index: idx,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Notable Offers</CardTitle>
            <CardDescription>
              Highlight top company offers with package details.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(
              watchedNotableOffers,
              "company_name",
            )}
            onClick={() =>
              notableOffersArray.append({
                id: `offer_${Date.now()}`,
                company_name: "",
                company_logo: "",
                company_initial: "",
                role: "",
                package: "",
                unit: "LPA",
                package_label: "Package Offered",
                badge: "",
                category: "",
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Offer
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">Section Title</Label>
            <Input
              placeholder="e.g. Notable Offers"
              {...register("notable_offers.title")}
            />
          </div>
          {notableOffersArray.fields.length === 0 ? (
            <PlacementsEmptyState label="offers" />
          ) : (
            <div className="space-y-3">
              {notableOffersArray.fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="border rounded-lg p-3 space-y-2 bg-muted/5"
                >
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Company Name</Label>
                      <Input
                        placeholder="e.g. Deloitte"
                        {...register(
                          `notable_offers.items.${idx}.company_name`,
                        )}
                      />
                      {errors.notable_offers?.items?.[idx]?.company_name && (
                        <p className="text-xs text-destructive">
                          {
                            errors.notable_offers.items[idx]?.company_name
                              ?.message
                          }
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Company Initial</Label>
                      <Input
                        placeholder="e.g. D"
                        {...register(
                          `notable_offers.items.${idx}.company_initial`,
                        )}
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-xs">Company Logo</Label>
                      <ImageUpload
                        value={
                          watch(`notable_offers.items.${idx}.company_logo`) ||
                          ""
                        }
                        onChange={(url) =>
                          setValue(
                            `notable_offers.items.${idx}.company_logo`,
                            url,
                          )
                        }
                        context={`placements/notable_offers_${idx}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Role</Label>
                      <Input
                        placeholder="e.g. Senior Analyst Role"
                        {...register(`notable_offers.items.${idx}.role`)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Category</Label>
                      <Input
                        placeholder="e.g. Consulting"
                        {...register(`notable_offers.items.${idx}.category`)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Package</Label>
                      <Input
                        placeholder="e.g. 14.5"
                        {...register(`notable_offers.items.${idx}.package`)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Unit</Label>
                      <Input
                        placeholder="e.g. LPA"
                        {...register(`notable_offers.items.${idx}.unit`)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Package Label</Label>
                      <Input
                        placeholder="e.g. Package Offered"
                        {...register(
                          `notable_offers.items.${idx}.package_label`,
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Badge</Label>
                      <Input
                        placeholder="e.g. HIGHEST"
                        {...register(`notable_offers.items.${idx}.badge`)}
                      />
                    </div>

                    <div className="flex items-end col-span-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setDeleteTarget({
                            array: "notable_offers",
                            index: idx,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Placement Trends */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">
              Placement Trends
            </CardTitle>
            <CardDescription>
              Year-on-year average package growth data points.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedTrendPoints, "year")}
            onClick={() =>
              trendPointsArray.append({
                year: "",
                avg_package: "",
                highlighted: false,
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Year
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs">Section Title</Label>
              <Input
                placeholder="e.g. Placement Trends"
                {...register("placement_trends.title")}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Duration</Label>
              <Input
                placeholder="e.g. Last 5 Years"
                {...register("placement_trends.duration_filter")}
              />
            </div>
          </div>
          <div className="border rounded-lg p-3 space-y-2 bg-muted/5">
            <Label className="text-xs font-semibold">Footer</Label>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Footer Label</Label>
                <Input
                  placeholder="e.g. Avg Package Growth"
                  {...register("placement_trends.footer.label")}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Footer Value</Label>
                <Input
                  placeholder="e.g. +12.5% YoY"
                  {...register("placement_trends.footer.value")}
                />
              </div>
            </div>
          </div>
          {trendPointsArray.fields.length === 0 ? (
            <PlacementsEmptyState label="trend points" />
          ) : (
            <div className="space-y-2">
              {trendPointsArray.fields.map((field, idx) => (
                <div key={field.id} className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <Input
                      className="w-28"
                      placeholder="Year (e.g. 2023)"
                      {...register(`placement_trends.data_points.${idx}.year`)}
                    />
                    <Input
                      className="flex-1"
                      placeholder="Avg Package (e.g. 4.2)"
                      {...register(
                        `placement_trends.data_points.${idx}.avg_package`,
                      )}
                    />
                    <div className="flex items-center gap-2">
                      <Label className="text-xs whitespace-nowrap">
                        Highlighted
                      </Label>
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-primary"
                        checked={
                          watch(
                            `placement_trends.data_points.${idx}.highlighted`,
                          ) ?? false
                        }
                        onChange={(e) =>
                          setValue(
                            `placement_trends.data_points.${idx}.highlighted`,
                            e.target.checked,
                          )
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setDeleteTarget({ array: "trend_points", index: idx })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  {errors.placement_trends?.data_points?.[idx]?.year && (
                    <p className="text-xs text-destructive">
                      {errors.placement_trends.data_points[idx]?.year?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Company Statistics */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">
              All Company Statistics
            </CardTitle>
            <CardDescription>
              Full statistics of students placed and packages by company.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedCompanyStats, "company_name")}
            onClick={() =>
              companyStatsArray.append({
                company_name: "",
                company_initial: "",
                company_logo: "",
                avg_package: "",
                max_package: "",
                students_placed: "",
                progress_percentage: "",
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Company
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">Section Title</Label>
            <Input
              placeholder="e.g. All Company Statistics"
              {...register("all_company_statistics.title")}
            />
          </div>
          {companyStatsArray.fields.length === 0 ? (
            <PlacementsEmptyState label="company statistics" />
          ) : (
            <div className="space-y-3">
              {companyStatsArray.fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="border rounded-lg p-3 space-y-2 bg-muted/5"
                >
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Company Name</Label>
                      <Input
                        placeholder="e.g. Deloitte"
                        {...register(
                          `all_company_statistics.rows.${idx}.company_name`,
                        )}
                      />
                      {errors.all_company_statistics?.rows?.[idx]
                        ?.company_name && (
                        <p className="text-xs text-destructive">
                          {
                            errors.all_company_statistics.rows[idx]
                              ?.company_name?.message
                          }
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Company Initial</Label>
                      <Input
                        placeholder="e.g. D"
                        {...register(
                          `all_company_statistics.rows.${idx}.company_initial`,
                        )}
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-xs">Company Logo</Label>
                      <ImageUpload
                        value={
                          watch(
                            `all_company_statistics.rows.${idx}.company_logo`,
                          ) || ""
                        }
                        onChange={(url) =>
                          setValue(
                            `all_company_statistics.rows.${idx}.company_logo`,
                            url,
                          )
                        }
                        context={`placements/all_company_stats_${idx}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Avg Package</Label>
                      <Input
                        placeholder="e.g. 9.2 L"
                        {...register(
                          `all_company_statistics.rows.${idx}.avg_package`,
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Max Package</Label>
                      <Input
                        placeholder="e.g. 14.5 L"
                        {...register(
                          `all_company_statistics.rows.${idx}.max_package`,
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Students Placed</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 145"
                        {...register(
                          `all_company_statistics.rows.${idx}.students_placed`,
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Progress Percentage</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 70"
                        {...register(
                          `all_company_statistics.rows.${idx}.progress_percentage`,
                        )}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setDeleteTarget({
                            array: "company_stats",
                            index: idx,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Industry Salary Report */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">
              Industry &amp; Salary Report
            </CardTitle>
            <CardDescription>
              Packages and placements split by industry sector.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedIndustryRows, "industry")}
            onClick={() =>
              industryRowsArray.append({
                industry: "",
                subtitle: "",
                avg_package: "",
                max_package: "",
                students_placed: "",
                progress_percentage: "",
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Sector
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">Section Title</Label>
            <Input
              placeholder="e.g. Industry & Salary Report"
              {...register("industry_salary_report.title")}
            />
          </div>
          {industryRowsArray.fields.length === 0 ? (
            <PlacementsEmptyState label="sectors" />
          ) : (
            <div className="space-y-3">
              {industryRowsArray.fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="border rounded-lg p-3 space-y-2 bg-muted/5"
                >
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Industry</Label>
                      <Input
                        placeholder="e.g. BFSI"
                        {...register(
                          `industry_salary_report.rows.${idx}.industry`,
                        )}
                      />
                      {errors.industry_salary_report?.rows?.[idx]?.industry && (
                        <p className="text-xs text-destructive">
                          {
                            errors.industry_salary_report.rows[idx]?.industry
                              ?.message
                          }
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Subtitle</Label>
                      <Input
                        placeholder="e.g. Banking & Finance"
                        {...register(
                          `industry_salary_report.rows.${idx}.subtitle`,
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Avg Package</Label>
                      <Input
                        placeholder="e.g. 8.2 L"
                        {...register(
                          `industry_salary_report.rows.${idx}.avg_package`,
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Max Package</Label>
                      <Input
                        placeholder="e.g. 12 LPA"
                        {...register(
                          `industry_salary_report.rows.${idx}.max_package`,
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Students Placed</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 155"
                        {...register(
                          `industry_salary_report.rows.${idx}.students_placed`,
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Progress Percentage</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 65"
                        {...register(
                          `industry_salary_report.rows.${idx}.progress_percentage`,
                        )}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setDeleteTarget({
                            array: "industry_rows",
                            index: idx,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Success Stories */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">
              Student Success Stories
            </CardTitle>
            <CardDescription>
              Video/quote testimonials from placed students.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(
              watchedSuccessStories,
              "student_name",
            )}
            onClick={() =>
              successStoriesArray.append({
                student_name: "",
                student_avatar: "",
                placed_at: "",
                quote: "",
                type: "youtube",
                thumbnail: "",
                video_url: "",
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Story
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">Section Title</Label>
            <Input
              placeholder="e.g. Student Success"
              {...register("student_success.title")}
            />
          </div>
          {successStoriesArray.fields.length === 0 ? (
            <PlacementsEmptyState label="success stories" />
          ) : (
            <div className="space-y-3">
              {successStoriesArray.fields.map((field, idx) => {
                const storyType =
                  watch(`student_success.items.${idx}.type`) || "youtube";
                return (
                  <div
                    key={field.id}
                    className="border rounded-lg p-3 space-y-2 bg-muted/5"
                  >
                    <div className="grid gap-2 md:grid-cols-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Student Name</Label>
                        <Input
                          placeholder="e.g. Rohan Mehta"
                          {...register(
                            `student_success.items.${idx}.student_name`,
                          )}
                        />
                        {errors.student_success?.items?.[idx]?.student_name && (
                          <p className="text-xs text-destructive">
                            {
                              errors.student_success.items[idx]?.student_name
                                ?.message
                            }
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Placed At</Label>
                        <Input
                          placeholder="e.g. Deloitte"
                          {...register(
                            `student_success.items.${idx}.placed_at`,
                          )}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Type</Label>
                        <Controller
                          name={`student_success.items.${idx}.type`}
                          control={control}
                          render={({ field: typeField }) => (
                            <Select
                              value={typeField.value || "youtube"}
                              onValueChange={(val) => {
                                typeField.onChange(val);
                                setValue(
                                  `student_success.items.${idx}.video_url`,
                                  "",
                                );
                              }}
                            >
                              <SelectTrigger className="h-10 text-xs">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="youtube">YouTube</SelectItem>
                                <SelectItem value="mp4">MP4 Video</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-1 md:col-span-3">
                        <Label className="text-xs">Quote</Label>
                        <Textarea
                          placeholder="e.g. The placement support helped me secure a role at a top firm."
                          {...register(`student_success.items.${idx}.quote`)}
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-xs">Student Avatar</Label>
                        <ImageUpload
                          value={
                            watch(
                              `student_success.items.${idx}.student_avatar`,
                            ) || ""
                          }
                          onChange={(url) =>
                            setValue(
                              `student_success.items.${idx}.student_avatar`,
                              url,
                            )
                          }
                          context={`placements/student_avatar_${idx}`}
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-xs">Thumbnail</Label>
                        <ImageUpload
                          value={
                            watch(`student_success.items.${idx}.thumbnail`) ||
                            ""
                          }
                          onChange={(url) =>
                            setValue(
                              `student_success.items.${idx}.thumbnail`,
                              url,
                            )
                          }
                          context={`placements/student_thumbnail_${idx}`}
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        {storyType === "youtube" ? (
                          <>
                            <Label className="text-xs">YouTube Video URL</Label>
                            <Input
                              placeholder="https://www.youtube.com/watch?v=..."
                              {...register(
                                `student_success.items.${idx}.video_url`,
                              )}
                            />
                          </>
                        ) : (
                          <>
                            <Label className="text-xs">MP4 Video</Label>
                            <div className="flex gap-2">
                              <Input
                                type="file"
                                accept="video/mp4"
                                disabled={
                                  uploadingField === `student_video_${idx}`
                                }
                                onChange={(e) =>
                                  onFieldUpload(
                                    e.target.files?.[0] ?? null,
                                    `student_video_${idx}`,
                                    `placements/student_video_${idx}`,
                                    (url) =>
                                      setValue(
                                        `student_success.items.${idx}.video_url`,
                                        url,
                                      ),
                                  )
                                }
                              />
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setDeleteTarget({
                              array: "success_stories",
                              index: idx,
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Download Report */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">Download Report</CardTitle>
          <CardDescription>
            PDF report link shown to students for full placement details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Report File</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                disabled={uploadingField === "download_report_url"}
                onChange={(e) =>
                  onFieldUpload(
                    e.target.files?.[0] ?? null,
                    "download_report_url",
                    "placements/download_report",
                    (url) => setValue("download_report.url", url),
                  )
                }
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Button Label</Label>
            <Input
              placeholder="e.g. Download Full Placement Report 2024"
              {...register("download_report.label")}
            />
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove Item"
        description="Remove this item? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          const { array, index } = deleteTarget;
          if (array === "summary_stats") summaryStatsArray.remove(index);
          else if (array === "notable_offers") notableOffersArray.remove(index);
          else if (array === "trend_points") trendPointsArray.remove(index);
          else if (array === "company_stats") companyStatsArray.remove(index);
          else if (array === "industry_rows") industryRowsArray.remove(index);
          else if (array === "success_stories")
            successStoriesArray.remove(index);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
