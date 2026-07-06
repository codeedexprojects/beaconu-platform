"use client";

import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SubjectTagInput } from "@/components/academics/shared/SubjectTagInput";

export function AcademicsCurriculumTab({
  payload,
  onChange,
  uploadingBrochure,
  onBrochureUpload,
}: {
  payload: any;
  onChange: (updates: any) => void;
  uploadingBrochure: boolean;
  onBrochureUpload: (file: File | null) => void;
}) {
  const getActiveTabPayload = () => payload;
  const updateActiveTabPayload = (updates: any) => onChange(updates);
  const handleBrochureUpload = onBrochureUpload;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Brochure Link</Label>
          <Input
            placeholder="https://example.com/brochure.pdf"
            value={getActiveTabPayload().curriculum?.brochure_link || ""}
            onChange={(e) =>
              updateActiveTabPayload({
                curriculum: {
                  ...(getActiveTabPayload().curriculum || {}),
                  brochure_link: e.target.value,
                },
              })
            }
          />
          <Input
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            disabled={uploadingBrochure}
            onChange={(e) => handleBrochureUpload(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      {/* Semesters inside Curriculum */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Semesters</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const currentSemesters =
                getActiveTabPayload().curriculum?.semesters || [];
              const n = currentSemesters.length + 1;
              updateActiveTabPayload({
                curriculum: {
                  ...(getActiveTabPayload().curriculum || {}),
                  semesters: [
                    ...currentSemesters,
                    {
                      id: `sem_${n}`,
                      name: `Semester ${n}`,
                      expanded: false,
                      footnote: "",
                      core_subjects: [],
                      specializations: [],
                    },
                  ],
                },
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Semester
          </Button>
        </div>
        {(getActiveTabPayload().curriculum?.semesters || []).map(
          (sem: any, idx: number) => {
            const updateSem = (patch: Record<string, unknown>) => {
              const next = [
                ...(getActiveTabPayload().curriculum?.semesters || []),
              ];
              next[idx] = { ...next[idx], ...patch };
              updateActiveTabPayload({
                curriculum: {
                  ...(getActiveTabPayload().curriculum || {}),
                  semesters: next,
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
                    placeholder="Semester Name (e.g. Semester 1)"
                    value={sem.name || ""}
                    onChange={(e) => updateSem({ name: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const next = (
                        getActiveTabPayload().curriculum?.semesters || []
                      ).filter((_: any, i: number) => i !== idx);
                      updateActiveTabPayload({
                        curriculum: {
                          ...(getActiveTabPayload().curriculum || {}),
                          semesters: next,
                        },
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Footnote
                  </Label>
                  <Textarea
                    placeholder="Footnote / semester note"
                    rows={2}
                    value={sem.footnote || ""}
                    onChange={(e) =>
                      updateSem({
                        footnote: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Core Subjects (one per line)
                  </Label>
                  <Textarea
                    placeholder="Subject 1&#10;Subject 2"
                    rows={3}
                    value={(sem.core_subjects || []).join("\n")}
                    onChange={(e) =>
                      updateSem({
                        core_subjects: e.target.value
                          .split("\n")
                          .map((s: string) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>

                {/* Specializations */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-muted-foreground">
                      Specializations
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateSem({
                          specializations: [
                            ...(sem.specializations || []),
                            {
                              title: "",
                              selected: "",
                              subjects: [],
                            },
                          ],
                        })
                      }
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  {(sem.specializations || []).map((sp: any, spIdx: number) => {
                    const updateSp = (spPatch: Record<string, unknown>) => {
                      const nextSp = [...(sem.specializations || [])];
                      nextSp[spIdx] = {
                        ...nextSp[spIdx],
                        ...spPatch,
                      };
                      updateSem({
                        specializations: nextSp,
                      });
                    };
                    return (
                      <div
                        key={spIdx}
                        className="border p-2 rounded space-y-2 bg-background"
                      >
                        <div className="flex gap-2 items-center">
                          <Input
                            className="flex-1"
                            placeholder='Title (e.g. "Specialization 1:")'
                            value={sp.title || ""}
                            onChange={(e) =>
                              updateSp({
                                title: e.target.value,
                              })
                            }
                          />
                          <Input
                            className="flex-1"
                            placeholder="Selected (e.g. Marketing)"
                            value={sp.selected || ""}
                            onChange={(e) =>
                              updateSp({
                                selected: e.target.value,
                              })
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const nextSp = (sem.specializations || []).filter(
                                (_: any, i: number) => i !== spIdx,
                              );
                              updateSem({
                                specializations: nextSp,
                              });
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                        <SubjectTagInput
                          placeholder="Type a subject and press Enter"
                          value={sp.subjects || []}
                          onChange={(subjects) => updateSp({ subjects })}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          },
        )}
      </div>

      {/* Course Structure Array */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Course Structure</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const next = [
                ...(getActiveTabPayload().course_structure || []),
                { title: "", credits: "" },
              ];
              updateActiveTabPayload({
                course_structure: next,
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Structure Group
          </Button>
        </div>
        {(getActiveTabPayload().course_structure || []).map(
          (cs: any, idx: number) => (
            <div
              key={idx}
              className="flex gap-2 items-start border p-3 rounded-lg bg-muted/5"
            >
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Group Title (e.g. Core Electives)"
                  value={cs.title || ""}
                  onChange={(e) => {
                    const next = [
                      ...(getActiveTabPayload().course_structure || []),
                    ];
                    next[idx] = {
                      ...next[idx],
                      title: e.target.value,
                    };
                    updateActiveTabPayload({
                      course_structure: next,
                    });
                  }}
                />
                <Input
                  type="number"
                  placeholder="Score / Credits (e.g. 12)"
                  value={cs.credits ?? ""}
                  onChange={(e) => {
                    const next = [
                      ...(getActiveTabPayload().course_structure || []),
                    ];
                    next[idx] = {
                      ...next[idx],
                      credits: e.target.value,
                    };
                    updateActiveTabPayload({
                      course_structure: next,
                    });
                  }}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const next = (
                    getActiveTabPayload().course_structure || []
                  ).filter((_: any, i: number) => i !== idx);
                  updateActiveTabPayload({
                    course_structure: next,
                  });
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ),
        )}
      </div>

      {/* Value Added Courses Array of strings */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Value Added Courses</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const next = [
                ...(getActiveTabPayload().value_added_courses || []),
                "",
              ];
              updateActiveTabPayload({
                value_added_courses: next,
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Value Course
          </Button>
        </div>
        {(getActiveTabPayload().value_added_courses || []).map(
          (vac: string, idx: number) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input
                placeholder="e.g. AI Ethics & Compliance"
                value={vac || ""}
                onChange={(e) => {
                  const next = [
                    ...(getActiveTabPayload().value_added_courses || []),
                  ];
                  next[idx] = e.target.value;
                  updateActiveTabPayload({
                    value_added_courses: next,
                  });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const next = (
                    getActiveTabPayload().value_added_courses || []
                  ).filter((_: any, i: number) => i !== idx);
                  updateActiveTabPayload({
                    value_added_courses: next,
                  });
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ),
        )}
      </div>

      {/* Higher Education Object */}
      <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
        <h4 className="font-bold text-sm text-foreground">
          Higher Education Pathways
        </h4>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Global Certifications</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const current =
                  getActiveTabPayload().higher_education
                    ?.global_certifications || [];
                updateActiveTabPayload({
                  higher_education: {
                    ...(getActiveTabPayload().higher_education || {}),
                    global_certifications: [...current, ""],
                  },
                });
              }}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Certification
            </Button>
          </div>
          {(
            getActiveTabPayload().higher_education?.global_certifications || []
          ).map((gc: string, idx: number) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input
                placeholder="e.g. AWS Solutions Architect"
                value={gc || ""}
                onChange={(e) => {
                  const next = [
                    ...(getActiveTabPayload().higher_education
                      ?.global_certifications || []),
                  ];
                  next[idx] = e.target.value;
                  updateActiveTabPayload({
                    higher_education: {
                      ...(getActiveTabPayload().higher_education || {}),
                      global_certifications: next,
                    },
                  });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const next = (
                    getActiveTabPayload().higher_education
                      ?.global_certifications || []
                  ).filter((_: any, i: number) => i !== idx);
                  updateActiveTabPayload({
                    higher_education: {
                      ...(getActiveTabPayload().higher_education || {}),
                      global_certifications: next,
                    },
                  });
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-3 pt-3 border-t">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Postgraduation Options</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const current =
                  getActiveTabPayload().higher_education?.postgraduation || [];
                updateActiveTabPayload({
                  higher_education: {
                    ...(getActiveTabPayload().higher_education || {}),
                    postgraduation: [...current, ""],
                  },
                });
              }}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Postgrad Path
            </Button>
          </div>
          {(getActiveTabPayload().higher_education?.postgraduation || []).map(
            (pg: string, idx: number) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  placeholder="e.g. M.Tech Research, PhD"
                  value={pg || ""}
                  onChange={(e) => {
                    const next = [
                      ...(getActiveTabPayload().higher_education
                        ?.postgraduation || []),
                    ];
                    next[idx] = e.target.value;
                    updateActiveTabPayload({
                      higher_education: {
                        ...(getActiveTabPayload().higher_education || {}),
                        postgraduation: next,
                      },
                    });
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const next = (
                      getActiveTabPayload().higher_education?.postgraduation ||
                      []
                    ).filter((_: any, i: number) => i !== idx);
                    updateActiveTabPayload({
                      higher_education: {
                        ...(getActiveTabPayload().higher_education || {}),
                        postgraduation: next,
                      },
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Flexible Exit Options */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Flexible Exit Options</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const next = [
                ...(getActiveTabPayload().flexible_exit_options || []),
                { title: "", description: "" },
              ];
              updateActiveTabPayload({
                flexible_exit_options: next,
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Exit Option
          </Button>
        </div>
        {(getActiveTabPayload().flexible_exit_options || []).map(
          (feo: any, idx: number) => (
            <div
              key={idx}
              className="space-y-2 border p-3 rounded-lg bg-muted/5"
            >
              <div className="flex gap-2 items-center">
                <Input
                  className="flex-1"
                  placeholder="Title (e.g. Diploma after 1 year)"
                  value={feo?.title || ""}
                  onChange={(e) => {
                    const next = [
                      ...(getActiveTabPayload().flexible_exit_options || []),
                    ];
                    next[idx] = {
                      ...next[idx],
                      title: e.target.value,
                    };
                    updateActiveTabPayload({
                      flexible_exit_options: next,
                    });
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const next = (
                      getActiveTabPayload().flexible_exit_options || []
                    ).filter((_: any, i: number) => i !== idx);
                    updateActiveTabPayload({
                      flexible_exit_options: next,
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <Textarea
                rows={2}
                placeholder="Description"
                value={feo?.description || ""}
                onChange={(e) => {
                  const next = [
                    ...(getActiveTabPayload().flexible_exit_options || []),
                  ];
                  next[idx] = {
                    ...next[idx],
                    description: e.target.value,
                  };
                  updateActiveTabPayload({
                    flexible_exit_options: next,
                  });
                }}
              />
            </div>
          ),
        )}
      </div>
    </div>
  );
}
