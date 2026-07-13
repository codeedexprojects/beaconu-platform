"use client";

import { Plus, Trash2 } from "lucide-react";
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
import { createTabListHelpers } from "@/components/academics/shared/tabListHelpers";

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
  const getActiveTabPayload = () => payload;
  const updateActiveTabPayload = (updates: any) => onChange(updates);
  const handleCourseFieldUpload = onFieldUpload;
  const { getTabList, addTabListItem, removeTabListItem, updateTabListItem } =
    createTabListHelpers(getActiveTabPayload, updateActiveTabPayload);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Section Title</Label>
          <Input
            placeholder="e.g. Placements"
            value={getActiveTabPayload().title || ""}
            onChange={(e) =>
              updateActiveTabPayload({
                title: e.target.value,
              })
            }
          />
        </div>
        <div className="flex items-center gap-3 pt-5">
          <Label className="text-xs">Enabled</Label>
          <input
            type="checkbox"
            className="h-4 w-4 accent-indigo-600"
            checked={getActiveTabPayload().enabled ?? true}
            onChange={(e) =>
              updateActiveTabPayload({
                enabled: e.target.checked,
              })
            }
          />
        </div>
      </div>

      {/* Summary Stats */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-indigo-950">
              Summary Stats
            </CardTitle>
            <CardDescription>
              Key placement numbers shown at the top (e.g. Average Package,
              Highest Package).
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              addTabListItem("summary_stats", {
                label: "",
                value: "",
                unit: "",
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Stat
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {getTabList("summary_stats").length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No stats added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {getTabList("summary_stats").map((item, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-3 space-y-2 bg-muted/5"
                >
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input
                        placeholder="e.g. Average Package"
                        value={item.label || ""}
                        onChange={(e) =>
                          updateTabListItem("summary_stats", idx, {
                            label: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Value</Label>
                      <Input
                        placeholder="e.g. 4.2"
                        value={item.value || ""}
                        onChange={(e) =>
                          updateTabListItem("summary_stats", idx, {
                            value: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Unit</Label>
                      <Input
                        placeholder="e.g. LPA"
                        value={item.unit || ""}
                        onChange={(e) =>
                          updateTabListItem("summary_stats", idx, {
                            unit: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTabListItem("summary_stats", idx)}
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

      {/* Notable Offers */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-indigo-950">
              Notable Offers
            </CardTitle>
            <CardDescription>
              Highlight top company offers with package details.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              addTabListItem("notable_offers.items", {
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
              value={(getActiveTabPayload().notable_offers as any)?.title || ""}
              onChange={(e) =>
                updateActiveTabPayload({
                  notable_offers: {
                    ...((getActiveTabPayload().notable_offers as any) || {}),
                    title: e.target.value,
                  },
                })
              }
            />
          </div>
          {getTabList("notable_offers.items").length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No offers added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {getTabList("notable_offers.items").map((item, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-3 space-y-2 bg-muted/5"
                >
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Company Name</Label>
                      <Input
                        placeholder="e.g. Deloitte"
                        value={item.company_name || ""}
                        onChange={(e) =>
                          updateTabListItem("notable_offers.items", idx, {
                            company_name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Company Initial</Label>
                      <Input
                        placeholder="e.g. D"
                        value={item.company_initial || ""}
                        onChange={(e) =>
                          updateTabListItem("notable_offers.items", idx, {
                            company_initial: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-xs">
                        Company Logo (Upload or URL)
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://cdn.example.com/logo.png"
                          value={item.company_logo || ""}
                          onChange={(e) =>
                            updateTabListItem("notable_offers.items", idx, {
                              company_logo: e.target.value,
                            })
                          }
                        />
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/svg+xml"
                          disabled={uploadingField === `notable_offers_${idx}`}
                          onChange={(e) =>
                            handleCourseFieldUpload(
                              e.target.files?.[0] ?? null,
                              `notable_offers_${idx}`,
                              `placements/notable_offers_${idx}`,
                              (url) =>
                                updateTabListItem("notable_offers.items", idx, {
                                  company_logo: url,
                                }),
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Role</Label>
                      <Input
                        placeholder="e.g. Senior Analyst Role"
                        value={item.role || ""}
                        onChange={(e) =>
                          updateTabListItem("notable_offers.items", idx, {
                            role: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Category</Label>
                      <Input
                        placeholder="e.g. Consulting"
                        value={item.category || ""}
                        onChange={(e) =>
                          updateTabListItem("notable_offers.items", idx, {
                            category: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Package</Label>
                      <Input
                        placeholder="e.g. 14.5"
                        value={item.package || ""}
                        onChange={(e) =>
                          updateTabListItem("notable_offers.items", idx, {
                            package: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Unit</Label>
                      <Input
                        placeholder="e.g. LPA"
                        value={item.unit || ""}
                        onChange={(e) =>
                          updateTabListItem("notable_offers.items", idx, {
                            unit: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Package Label</Label>
                      <Input
                        placeholder="e.g. Package Offered"
                        value={item.package_label || ""}
                        onChange={(e) =>
                          updateTabListItem("notable_offers.items", idx, {
                            package_label: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Badge</Label>
                      <Input
                        placeholder="e.g. HIGHEST"
                        value={item.badge || ""}
                        onChange={(e) =>
                          updateTabListItem("notable_offers.items", idx, {
                            badge: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-end col-span-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeTabListItem("notable_offers.items", idx)
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
            <CardTitle className="text-lg font-bold text-indigo-950">
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
            onClick={() =>
              addTabListItem("placement_trends.data_points", {
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
                value={
                  (getActiveTabPayload().placement_trends as any)?.title || ""
                }
                onChange={(e) =>
                  updateActiveTabPayload({
                    placement_trends: {
                      ...((getActiveTabPayload().placement_trends as any) ||
                        {}),
                      title: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Duration</Label>
              <Input
                placeholder="e.g. Last 5 Years"
                value={
                  (getActiveTabPayload().placement_trends as any)
                    ?.duration_filter || ""
                }
                onChange={(e) =>
                  updateActiveTabPayload({
                    placement_trends: {
                      ...((getActiveTabPayload().placement_trends as any) ||
                        {}),
                      duration_filter: e.target.value,
                    },
                  })
                }
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
                  value={
                    (getActiveTabPayload().placement_trends as any)?.footer
                      ?.label || ""
                  }
                  onChange={(e) =>
                    updateActiveTabPayload({
                      placement_trends: {
                        ...((getActiveTabPayload().placement_trends as any) ||
                          {}),
                        footer: {
                          ...((getActiveTabPayload().placement_trends as any)
                            ?.footer || {}),
                          label: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Footer Value</Label>
                <Input
                  placeholder="e.g. +12.5% YoY"
                  value={
                    (getActiveTabPayload().placement_trends as any)?.footer
                      ?.value || ""
                  }
                  onChange={(e) =>
                    updateActiveTabPayload({
                      placement_trends: {
                        ...((getActiveTabPayload().placement_trends as any) ||
                          {}),
                        footer: {
                          ...((getActiveTabPayload().placement_trends as any)
                            ?.footer || {}),
                          value: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
          {getTabList("placement_trends.data_points").length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No trend points added yet.
            </p>
          ) : (
            <div className="space-y-2">
              {getTabList("placement_trends.data_points").map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    className="w-28"
                    placeholder="Year (e.g. 2023)"
                    value={item.year || ""}
                    onChange={(e) =>
                      updateTabListItem("placement_trends.data_points", idx, {
                        year: e.target.value,
                      })
                    }
                  />
                  <Input
                    className="flex-1"
                    placeholder="Avg Package (e.g. 4.2)"
                    value={item.avg_package ?? ""}
                    onChange={(e) =>
                      updateTabListItem("placement_trends.data_points", idx, {
                        avg_package: e.target.value,
                      })
                    }
                  />
                  <div className="flex items-center gap-2">
                    <Label className="text-xs whitespace-nowrap">
                      Highlighted
                    </Label>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-indigo-600"
                      checked={item.highlighted ?? false}
                      onChange={(e) =>
                        updateTabListItem("placement_trends.data_points", idx, {
                          highlighted: e.target.checked,
                        })
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      removeTabListItem("placement_trends.data_points", idx)
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
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
            <CardTitle className="text-lg font-bold text-indigo-950">
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
            onClick={() =>
              addTabListItem("all_company_statistics.rows", {
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
              value={
                (getActiveTabPayload().all_company_statistics as any)?.title ||
                ""
              }
              onChange={(e) =>
                updateActiveTabPayload({
                  all_company_statistics: {
                    ...((getActiveTabPayload().all_company_statistics as any) ||
                      {}),
                    title: e.target.value,
                  },
                })
              }
            />
          </div>
          {getTabList("all_company_statistics.rows").length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No company statistics added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {getTabList("all_company_statistics.rows").map((item, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-3 space-y-2 bg-muted/5"
                >
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Company Name</Label>
                      <Input
                        placeholder="e.g. Deloitte"
                        value={item.company_name || ""}
                        onChange={(e) =>
                          updateTabListItem(
                            "all_company_statistics.rows",
                            idx,
                            {
                              company_name: e.target.value,
                            },
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Company Initial</Label>
                      <Input
                        placeholder="e.g. D"
                        value={item.company_initial || ""}
                        onChange={(e) =>
                          updateTabListItem(
                            "all_company_statistics.rows",
                            idx,
                            {
                              company_initial: e.target.value,
                            },
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-xs">
                        Company Logo (Upload or URL)
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://cdn.example.com/logo.png"
                          value={item.company_logo || ""}
                          onChange={(e) =>
                            updateTabListItem(
                              "all_company_statistics.rows",
                              idx,
                              {
                                company_logo: e.target.value,
                              },
                            )
                          }
                        />
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/svg+xml"
                          disabled={
                            uploadingField === `all_company_stats_${idx}`
                          }
                          onChange={(e) =>
                            handleCourseFieldUpload(
                              e.target.files?.[0] ?? null,
                              `all_company_stats_${idx}`,
                              `placements/all_company_stats_${idx}`,
                              (url) =>
                                updateTabListItem(
                                  "all_company_statistics.rows",
                                  idx,
                                  { company_logo: url },
                                ),
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Avg Package</Label>
                      <Input
                        placeholder="e.g. 9.2 L"
                        value={item.avg_package || ""}
                        onChange={(e) =>
                          updateTabListItem(
                            "all_company_statistics.rows",
                            idx,
                            { avg_package: e.target.value },
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Max Package</Label>
                      <Input
                        placeholder="e.g. 14.5 L"
                        value={item.max_package || ""}
                        onChange={(e) =>
                          updateTabListItem(
                            "all_company_statistics.rows",
                            idx,
                            { max_package: e.target.value },
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Students Placed</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 145"
                        value={item.students_placed ?? ""}
                        onChange={(e) =>
                          updateTabListItem(
                            "all_company_statistics.rows",
                            idx,
                            {
                              students_placed: e.target.value
                                ? e.target.value
                                : "",
                            },
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Progress Percentage</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 70"
                        value={item.progress_percentage ?? ""}
                        onChange={(e) =>
                          updateTabListItem(
                            "all_company_statistics.rows",
                            idx,
                            {
                              progress_percentage: e.target.value
                                ? e.target.value
                                : "",
                            },
                          )
                        }
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeTabListItem("all_company_statistics.rows", idx)
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
            <CardTitle className="text-lg font-bold text-indigo-950">
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
            onClick={() =>
              addTabListItem("industry_salary_report.rows", {
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
              value={
                (getActiveTabPayload().industry_salary_report as any)?.title ||
                ""
              }
              onChange={(e) =>
                updateActiveTabPayload({
                  industry_salary_report: {
                    ...((getActiveTabPayload().industry_salary_report as any) ||
                      {}),
                    title: e.target.value,
                  },
                })
              }
            />
          </div>
          {getTabList("industry_salary_report.rows").length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No sectors added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {getTabList("industry_salary_report.rows").map((item, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-3 space-y-2 bg-muted/5"
                >
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Industry</Label>
                      <Input
                        placeholder="e.g. BFSI"
                        value={item.industry || ""}
                        onChange={(e) =>
                          updateTabListItem(
                            "industry_salary_report.rows",
                            idx,
                            { industry: e.target.value },
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Subtitle</Label>
                      <Input
                        placeholder="e.g. Banking & Finance"
                        value={item.subtitle || ""}
                        onChange={(e) =>
                          updateTabListItem(
                            "industry_salary_report.rows",
                            idx,
                            { subtitle: e.target.value },
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Avg Package</Label>
                      <Input
                        placeholder="e.g. 8.2 L"
                        value={item.avg_package || ""}
                        onChange={(e) =>
                          updateTabListItem(
                            "industry_salary_report.rows",
                            idx,
                            { avg_package: e.target.value },
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Max Package</Label>
                      <Input
                        placeholder="e.g. 12 LPA"
                        value={item.max_package || ""}
                        onChange={(e) =>
                          updateTabListItem(
                            "industry_salary_report.rows",
                            idx,
                            { max_package: e.target.value },
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Students Placed</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 155"
                        value={item.students_placed ?? ""}
                        onChange={(e) =>
                          updateTabListItem(
                            "industry_salary_report.rows",
                            idx,
                            {
                              students_placed: e.target.value
                                ? e.target.value
                                : "",
                            },
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Progress Percentage</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 65"
                        value={item.progress_percentage ?? ""}
                        onChange={(e) =>
                          updateTabListItem(
                            "industry_salary_report.rows",
                            idx,
                            {
                              progress_percentage: e.target.value
                                ? e.target.value
                                : "",
                            },
                          )
                        }
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeTabListItem("industry_salary_report.rows", idx)
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
            <CardTitle className="text-lg font-bold text-indigo-950">
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
            onClick={() =>
              addTabListItem("student_success.items", {
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
              value={
                (getActiveTabPayload().student_success as any)?.title || ""
              }
              onChange={(e) =>
                updateActiveTabPayload({
                  student_success: {
                    ...((getActiveTabPayload().student_success as any) || {}),
                    title: e.target.value,
                  },
                })
              }
            />
          </div>
          {getTabList("student_success.items").length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No success stories added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {getTabList("student_success.items").map((item, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-3 space-y-2 bg-muted/5"
                >
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Student Name</Label>
                      <Input
                        placeholder="e.g. Rohan Mehta"
                        value={item.student_name || ""}
                        onChange={(e) =>
                          updateTabListItem("student_success.items", idx, {
                            student_name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Placed At</Label>
                      <Input
                        placeholder="e.g. Deloitte"
                        value={item.placed_at || ""}
                        onChange={(e) =>
                          updateTabListItem("student_success.items", idx, {
                            placed_at: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={item.type || "youtube"}
                        onValueChange={(val) =>
                          updateTabListItem("student_success.items", idx, {
                            type: val,
                            video_url: "",
                          })
                        }
                      >
                        <SelectTrigger className="h-10 text-xs">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="mp4">MP4 Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 md:col-span-3">
                      <Label className="text-xs">Quote</Label>
                      <Textarea
                        placeholder="e.g. The placement support helped me secure a role at a top firm."
                        value={item.quote || ""}
                        onChange={(e) =>
                          updateTabListItem("student_success.items", idx, {
                            quote: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-xs">
                        Student Avatar (Upload or URL)
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://cdn.example.com/photo.jpg"
                          value={item.student_avatar || ""}
                          onChange={(e) =>
                            updateTabListItem("student_success.items", idx, {
                              student_avatar: e.target.value,
                            })
                          }
                        />
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={uploadingField === `student_avatar_${idx}`}
                          onChange={(e) =>
                            handleCourseFieldUpload(
                              e.target.files?.[0] ?? null,
                              `student_avatar_${idx}`,
                              `placements/student_avatar_${idx}`,
                              (url) =>
                                updateTabListItem(
                                  "student_success.items",
                                  idx,
                                  { student_avatar: url },
                                ),
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-xs">
                        Thumbnail (Upload or URL)
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://cdn.example.com/thumb.jpg"
                          value={item.thumbnail || ""}
                          onChange={(e) =>
                            updateTabListItem("student_success.items", idx, {
                              thumbnail: e.target.value,
                            })
                          }
                        />
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={
                            uploadingField === `student_thumbnail_${idx}`
                          }
                          onChange={(e) =>
                            handleCourseFieldUpload(
                              e.target.files?.[0] ?? null,
                              `student_thumbnail_${idx}`,
                              `placements/student_thumbnail_${idx}`,
                              (url) =>
                                updateTabListItem(
                                  "student_success.items",
                                  idx,
                                  { thumbnail: url },
                                ),
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      {!item.type || item.type === "youtube" ? (
                        <>
                          <Label className="text-xs">YouTube Video URL</Label>
                          <Input
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={item.video_url || ""}
                            onChange={(e) =>
                              updateTabListItem("student_success.items", idx, {
                                video_url: e.target.value,
                              })
                            }
                          />
                        </>
                      ) : (
                        <>
                          <Label className="text-xs">
                            MP4 Video (Upload or URL)
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="https://cdn.example.com/video.mp4"
                              value={item.video_url || ""}
                              onChange={(e) =>
                                updateTabListItem(
                                  "student_success.items",
                                  idx,
                                  {
                                    video_url: e.target.value,
                                  },
                                )
                              }
                            />
                            <Input
                              type="file"
                              accept="video/mp4"
                              disabled={
                                uploadingField === `student_video_${idx}`
                              }
                              onChange={(e) =>
                                handleCourseFieldUpload(
                                  e.target.files?.[0] ?? null,
                                  `student_video_${idx}`,
                                  `placements/student_video_${idx}`,
                                  (url) =>
                                    updateTabListItem(
                                      "student_success.items",
                                      idx,
                                      { video_url: url },
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
                          removeTabListItem("student_success.items", idx)
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

      {/* Download Report */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-indigo-950">
            Download Report
          </CardTitle>
          <CardDescription>
            PDF report link shown to students for full placement details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Report File (Upload or URL)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://cdn.example.com/placement-report-2024.pdf"
                value={
                  (getActiveTabPayload().download_report as any)?.url || ""
                }
                onChange={(e) =>
                  updateActiveTabPayload({
                    download_report: {
                      ...((getActiveTabPayload().download_report as any) || {}),
                      url: e.target.value,
                    },
                  })
                }
              />
              <Input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                disabled={uploadingField === "download_report_url"}
                onChange={(e) =>
                  handleCourseFieldUpload(
                    e.target.files?.[0] ?? null,
                    "download_report_url",
                    "placements/download_report",
                    (url) =>
                      updateActiveTabPayload({
                        download_report: {
                          ...((getActiveTabPayload().download_report as any) ||
                            {}),
                          url,
                        },
                      }),
                  )
                }
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Button Label</Label>
            <Input
              placeholder="e.g. Download Full Placement Report 2024"
              value={
                (getActiveTabPayload().download_report as any)?.label || ""
              }
              onChange={(e) =>
                updateActiveTabPayload({
                  download_report: {
                    ...((getActiveTabPayload().download_report as any) || {}),
                    label: e.target.value,
                  },
                })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
