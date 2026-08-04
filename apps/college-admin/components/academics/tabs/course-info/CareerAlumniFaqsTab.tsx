"use client";

import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CareerAlumniFaqsTab({
  payload,
  onChange,
  uploadingAlumniIndex,
  onAlumniImageUpload,
}: {
  payload: any;
  onChange: (updates: any) => void;
  uploadingAlumniIndex: number | null;
  onAlumniImageUpload: (file: File | null, idx: number) => void;
}) {
  const getActiveTabPayload = () => payload;
  const updateActiveTabPayload = (updates: any) => onChange(updates);
  const handleAlumniImageUpload = onAlumniImageUpload;

  const getFaqItems = (): any[] => {
    const faqs = getActiveTabPayload().faqs;
    if (!faqs) return [];
    if (Array.isArray(faqs)) return faqs;
    return Array.isArray(faqs.items) ? faqs.items : [];
  };

  const getFaqTitle = (): string => {
    const faqs = getActiveTabPayload().faqs;
    if (!faqs || Array.isArray(faqs)) return "";
    return faqs.title || "";
  };

  const updateFaqs = (patch: { title?: string; items?: any[] }) => {
    const currentFaqs = getActiveTabPayload().faqs;
    let title = patch.title !== undefined ? patch.title : "";
    let items = patch.items !== undefined ? patch.items : [];

    if (currentFaqs && !Array.isArray(currentFaqs)) {
      if (patch.title === undefined) title = currentFaqs.title || "";
      if (patch.items === undefined) items = currentFaqs.items || [];
    } else if (currentFaqs && Array.isArray(currentFaqs)) {
      if (patch.items === undefined) items = currentFaqs;
    }

    updateActiveTabPayload({
      faqs: {
        title,
        items,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Career Opportunities</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const next = [
                ...(getActiveTabPayload().career_opportunities || []),
                { role: "", salary_range: "" },
              ];
              updateActiveTabPayload({
                career_opportunities: next,
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Opportunity
          </Button>
        </div>
        {(getActiveTabPayload().career_opportunities || []).map(
          (co: any, idx: number) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input
                className="flex-1"
                placeholder="e.g. Digital Transformation Consultant, Product Manager"
                value={(typeof co === "string" ? co : co?.role) || ""}
                onChange={(e) => {
                  const next = [
                    ...(getActiveTabPayload().career_opportunities || []),
                  ];
                  const existing = next[idx];
                  next[idx] = {
                    role: e.target.value,
                    salary_range:
                      (typeof existing === "string"
                        ? ""
                        : existing?.salary_range) || "",
                  };
                  updateActiveTabPayload({
                    career_opportunities: next,
                  });
                }}
              />
              <Input
                className="w-36"
                placeholder="LPA Range (e.g. 6-10 LPA)"
                value={(typeof co === "string" ? "" : co?.salary_range) || ""}
                onChange={(e) => {
                  const next = [
                    ...(getActiveTabPayload().career_opportunities || []),
                  ];
                  const existing = next[idx];
                  next[idx] = {
                    role:
                      (typeof existing === "string"
                        ? existing
                        : existing?.role) || "",
                    salary_range: e.target.value,
                  };
                  updateActiveTabPayload({
                    career_opportunities: next,
                  });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const next = (
                    getActiveTabPayload().career_opportunities || []
                  ).filter((_: any, i: number) => i !== idx);
                  updateActiveTabPayload({
                    career_opportunities: next,
                  });
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ),
        )}
      </div>

      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-foreground">Featured Alumni</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const currentItems =
                getActiveTabPayload().featuredAlumni?.items || [];
              updateActiveTabPayload({
                featuredAlumni: {
                  ...(getActiveTabPayload().featuredAlumni || {}),
                  items: [
                    ...currentItems,
                    {
                      name: "",
                      image: "",
                      designation: "",
                      career_progression: [],
                    },
                  ],
                },
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Alumnus
          </Button>
        </div>
        {(getActiveTabPayload().featuredAlumni?.items || []).map(
          (al: any, idx: number) => {
            const updateAl = (patch: Record<string, unknown>) => {
              const next = [
                ...(getActiveTabPayload().featuredAlumni?.items || []),
              ];
              next[idx] = { ...next[idx], ...patch };
              updateActiveTabPayload({
                featuredAlumni: {
                  ...(getActiveTabPayload().featuredAlumni || {}),
                  items: next,
                },
              });
            };
            return (
              <div
                key={idx}
                className="border p-3 rounded-lg bg-muted/5 space-y-3"
              >
                <div className="flex gap-2 items-center">
                  <Input
                    className="flex-1"
                    placeholder="Alumni Name"
                    value={al.name || ""}
                    onChange={(e) => updateAl({ name: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const next = (
                        getActiveTabPayload().featuredAlumni?.items || []
                      ).filter((_: any, i: number) => i !== idx);
                      updateActiveTabPayload({
                        featuredAlumni: {
                          ...(getActiveTabPayload().featuredAlumni || {}),
                          items: next,
                        },
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <Input
                  placeholder="Designation"
                  value={al.designation || ""}
                  onChange={(e) =>
                    updateAl({
                      designation: e.target.value,
                    })
                  }
                />

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Image URL
                  </Label>
                  <Input
                    placeholder="https://..."
                    value={al.image || ""}
                    onChange={(e) => updateAl({ image: e.target.value })}
                  />
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploadingAlumniIndex === idx}
                    onChange={(e) =>
                      handleAlumniImageUpload(e.target.files?.[0] ?? null, idx)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-muted-foreground">
                      Career Progression
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateAl({
                          career_progression: [
                            ...(al.career_progression || []),
                            { year: "", description: "" },
                          ],
                        })
                      }
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Entry
                    </Button>
                  </div>
                  {(al.career_progression || []).map(
                    (cp: any, cpIdx: number) => {
                      const updateCp = (cpPatch: Record<string, unknown>) => {
                        const nextCp = [...(al.career_progression || [])];
                        nextCp[cpIdx] = {
                          ...nextCp[cpIdx],
                          ...cpPatch,
                        };
                        updateAl({
                          career_progression: nextCp,
                        });
                      };
                      return (
                        <div
                          key={cpIdx}
                          className="border p-2 rounded space-y-2 bg-background"
                        >
                          <div className="flex gap-2 items-center">
                            <Input
                              className="w-24"
                              placeholder="Year"
                              value={cp.year || ""}
                              onChange={(e) =>
                                updateCp({
                                  year: e.target.value,
                                })
                              }
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const nextCp = (
                                  al.career_progression || []
                                ).filter((_: any, i: number) => i !== cpIdx);
                                updateAl({
                                  career_progression: nextCp,
                                });
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                          <Textarea
                            placeholder="Description"
                            rows={2}
                            value={cp.description || ""}
                            onChange={(e) =>
                              updateCp({
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            );
          },
        )}
      </div>

      <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
        <div className="flex justify-between items-center">
          <div>
            <Label className="font-bold text-sm">FAQs</Label>
            <p className="text-xs text-muted-foreground">Section Title</p>
          </div>
          <Input
            placeholder="e.g. Frequently Asked Questions"
            className="w-60"
            value={getFaqTitle()}
            onChange={(e) => updateFaqs({ title: e.target.value })}
          />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Label className="text-xs font-semibold">Questions & Answers</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const next = [...getFaqItems(), { question: "", answer: "" }];
              updateFaqs({ items: next });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add FAQ
          </Button>
        </div>
        {getFaqItems().map((faq: any, idx: number) => (
          <div
            key={idx}
            className="flex gap-2 items-start border p-3 rounded-lg bg-background"
          >
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Question"
                value={faq.question || ""}
                onChange={(e) => {
                  const next = [...getFaqItems()];
                  next[idx] = {
                    ...next[idx],
                    question: e.target.value,
                  };
                  updateFaqs({ items: next });
                }}
              />
              <Textarea
                placeholder="Answer"
                rows={2}
                value={faq.answer || ""}
                onChange={(e) => {
                  const next = [...getFaqItems()];
                  next[idx] = {
                    ...next[idx],
                    answer: e.target.value,
                  };
                  updateFaqs({ items: next });
                }}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                const next = getFaqItems().filter(
                  (_: any, i: number) => i !== idx,
                );
                updateFaqs({ items: next });
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
