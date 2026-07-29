"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconPickerField } from "@/components/icon-picker";

export function ExamPatternsTab({
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
  const [examPolicyPatternIdx, setExamPolicyPatternIdx] = useState<number>(0);
  const getActiveTabPayload = () => payload;
  const updateActiveTabPayload = (updates: any) => onChange(updates);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Label className="font-bold">Evaluation Patterns</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const next = [
              ...(getActiveTabPayload().evaluation_patterns || []),
              {
                pattern_type: "",
                duration: "",
                chart: { total: 100, segments: [] },
                subtotals: [],
                internal_assessment: [],
                external_examination: [],
                summary_cards: [],
                exam_duration: {
                  label: "EXAM DURATION",
                  value: "",
                },
              },
            ];
            updateActiveTabPayload({
              evaluation_patterns: next,
            });
            setExamPolicyPatternIdx(next.length - 1);
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Pattern
        </Button>
      </div>

      {(getActiveTabPayload().evaluation_patterns || []).length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {(getActiveTabPayload().evaluation_patterns || []).map(
            (p: any, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => setExamPolicyPatternIdx(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  examPolicyPatternIdx === idx
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {p.pattern_type || `Pattern ${idx + 1}`}
              </button>
            ),
          )}
        </div>
      )}

      {(() => {
        const patterns = getActiveTabPayload().evaluation_patterns || [];
        const pi = examPolicyPatternIdx;
        if (pi >= patterns.length) return null;
        const pat = patterns[pi] || {};
        const updatePattern = (updates: any) => {
          const next = [...patterns];
          next[pi] = { ...next[pi], ...updates };
          updateActiveTabPayload({
            evaluation_patterns: next,
          });
        };
        return (
          <div className="space-y-6 border p-4 rounded-xl bg-muted/5">
            {/* Pattern header */}
            <div className="flex gap-4 items-start">
              <div className="flex-1 grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Pattern Type</Label>
                  <Input
                    placeholder="e.g. Course with Practical"
                    value={pat.pattern_type || ""}
                    onChange={(e) =>
                      updatePattern({
                        pattern_type: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Duration</Label>
                  <Input
                    placeholder="e.g. 2 + 3 Hrs"
                    value={pat.duration || ""}
                    onChange={(e) =>
                      updatePattern({
                        duration: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Exam Duration Label</Label>
                  <Input
                    placeholder="e.g. DURATION"
                    value={pat.exam_duration?.label || ""}
                    onChange={(e) =>
                      updatePattern({
                        exam_duration: {
                          ...(pat.exam_duration || {}),
                          label: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Exam Duration Value</Label>
                  <Input
                    placeholder="e.g. 2 + 3 Hrs"
                    value={pat.exam_duration?.value || ""}
                    onChange={(e) =>
                      updatePattern({
                        exam_duration: {
                          ...(pat.exam_duration || {}),
                          value: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const next = patterns.filter((_: any, i: number) => i !== pi);
                  updateActiveTabPayload({
                    evaluation_patterns: next,
                  });
                  setExamPolicyPatternIdx(Math.max(0, pi - 1));
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            {/* Chart Segments */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-sm">Chart Segments</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const segs = [
                      ...(pat.chart?.segments || []),
                      {
                        label: "",
                        percent: 0,
                      },
                    ];
                    updatePattern({
                      chart: {
                        ...(pat.chart || {
                          total: 100,
                        }),
                        segments: segs,
                      },
                    });
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Segment
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Chart Total</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={pat.chart?.total ?? 100}
                    onChange={(e) =>
                      updatePattern({
                        chart: {
                          ...(pat.chart || {}),
                          total: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Chart Total Label</Label>
                  <Input
                    placeholder="e.g. Total"
                    value={pat.chart?.total_label || ""}
                    onChange={(e) =>
                      updatePattern({
                        chart: {
                          ...(pat.chart || {
                            total: 100,
                          }),
                          total_label: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
              {(pat.chart?.segments || []).map((seg: any, si: number) => (
                <div key={si} className="flex gap-2 items-center">
                  <Input
                    placeholder="Label (e.g. Theory)"
                    value={seg.label || ""}
                    onChange={(e) => {
                      const segs = [...(pat.chart?.segments || [])];
                      segs[si] = {
                        ...segs[si],
                        label: e.target.value,
                      };
                      updatePattern({
                        chart: {
                          ...(pat.chart || {
                            total: 100,
                          }),
                          segments: segs,
                        },
                      });
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="%"
                    className="w-20"
                    value={seg.percent ?? ""}
                    onChange={(e) => {
                      const segs = [...(pat.chart?.segments || [])];
                      segs[si] = {
                        ...segs[si],
                        percent: Number(e.target.value),
                      };
                      updatePattern({
                        chart: {
                          ...(pat.chart || {
                            total: 100,
                          }),
                          segments: segs,
                        },
                      });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const segs = (pat.chart?.segments || []).filter(
                        (_: any, i: number) => i !== si,
                      );
                      updatePattern({
                        chart: {
                          ...(pat.chart || {
                            total: 100,
                          }),
                          segments: segs,
                        },
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Subtotals */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-sm">Subtotals</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updatePattern({
                      subtotals: [
                        ...(pat.subtotals || []),
                        { label: "", marks: 0 },
                      ],
                    })
                  }
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Subtotal
                </Button>
              </div>
              {(pat.subtotals || []).map((st: any, si: number) => (
                <div key={si} className="flex gap-2 items-center">
                  <Input
                    placeholder="Label (e.g. ISA Theory)"
                    value={st.label || ""}
                    onChange={(e) => {
                      const next = [...(pat.subtotals || [])];
                      next[si] = {
                        ...next[si],
                        label: e.target.value,
                      };
                      updatePattern({
                        subtotals: next,
                      });
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Marks"
                    className="w-24"
                    value={st.marks ?? ""}
                    onChange={(e) => {
                      const next = [...(pat.subtotals || [])];
                      next[si] = {
                        ...next[si],
                        marks: e.target.value,
                      };
                      updatePattern({
                        subtotals: next,
                      });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      updatePattern({
                        subtotals: (pat.subtotals || []).filter(
                          (_: any, i: number) => i !== si,
                        ),
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Summary Cards */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-sm">Summary Cards</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updatePattern({
                      summary_cards: [
                        ...(pat.summary_cards || []),
                        { label: "", value: "" },
                      ],
                    })
                  }
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Card
                </Button>
              </div>
              {(pat.summary_cards || []).map((sc: any, si: number) => (
                <div key={si} className="flex gap-2 items-center">
                  <Input
                    placeholder="Label (e.g. ISA THEORY)"
                    value={sc.label || ""}
                    onChange={(e) => {
                      const next = [...(pat.summary_cards || [])];
                      next[si] = {
                        ...next[si],
                        label: e.target.value,
                      };
                      updatePattern({
                        summary_cards: next,
                      });
                    }}
                  />
                  <Input
                    placeholder="Value (e.g. 20 Marks)"
                    value={sc.value || ""}
                    onChange={(e) => {
                      const next = [...(pat.summary_cards || [])];
                      next[si] = {
                        ...next[si],
                        value: e.target.value,
                      };
                      updatePattern({
                        summary_cards: next,
                      });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      updatePattern({
                        summary_cards: (pat.summary_cards || []).filter(
                          (_: any, i: number) => i !== si,
                        ),
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Internal Assessment Sections */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-sm">
                  Internal Assessment (ISA) Sections
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updatePattern({
                      internal_assessment: [
                        ...(pat.internal_assessment || []),
                        { section: "", components: [] },
                      ],
                    })
                  }
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Section
                </Button>
              </div>
              {(pat.internal_assessment || []).map((ias: any, si: number) => (
                <div
                  key={si}
                  className="border p-3 rounded-lg space-y-3 bg-muted/10"
                >
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Section name (e.g. ISA - Theory)"
                      value={ias.section || ""}
                      onChange={(e) => {
                        const next = [...(pat.internal_assessment || [])];
                        next[si] = {
                          ...next[si],
                          section: e.target.value,
                        };
                        updatePattern({
                          internal_assessment: next,
                        });
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updatePattern({
                          internal_assessment: (
                            pat.internal_assessment || []
                          ).filter((_: any, i: number) => i !== si),
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="pl-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs text-muted-foreground">
                        Components
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const sections = [...(pat.internal_assessment || [])];
                          sections[si] = {
                            ...sections[si],
                            components: [
                              ...(sections[si].components || []),
                              {
                                name: "",
                                marks: 0,
                                description: "",
                                icon: "",
                                sub_components: [],
                              },
                            ],
                          };
                          updatePattern({
                            internal_assessment: sections,
                          });
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Component
                      </Button>
                    </div>
                    {(ias.components || []).map((comp: any, ci: number) => (
                      <div
                        key={ci}
                        className="border p-3 rounded-lg space-y-2 bg-white/50"
                      >
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder="Name (e.g. Test Papers)"
                            value={comp.name || ""}
                            onChange={(e) => {
                              const sections = [
                                ...(pat.internal_assessment || []),
                              ];
                              const comps = [
                                ...(sections[si].components || []),
                              ];
                              comps[ci] = {
                                ...comps[ci],
                                name: e.target.value,
                              };
                              sections[si] = {
                                ...sections[si],
                                components: comps,
                              };
                              updatePattern({
                                internal_assessment: sections,
                              });
                            }}
                          />
                          <Input
                            type="number"
                            placeholder="Marks"
                            className="w-20"
                            value={comp.marks ?? ""}
                            onChange={(e) => {
                              const sections = [
                                ...(pat.internal_assessment || []),
                              ];
                              const comps = [
                                ...(sections[si].components || []),
                              ];
                              comps[ci] = {
                                ...comps[ci],
                                marks: Number(e.target.value),
                              };
                              sections[si] = {
                                ...sections[si],
                                components: comps,
                              };
                              updatePattern({
                                internal_assessment: sections,
                              });
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const sections = [
                                ...(pat.internal_assessment || []),
                              ];
                              sections[si] = {
                                ...sections[si],
                                components: (
                                  sections[si].components || []
                                ).filter((_: any, i: number) => i !== ci),
                              };
                              updatePattern({
                                internal_assessment: sections,
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Description (optional)"
                          value={comp.description || ""}
                          onChange={(e) => {
                            const sections = [
                              ...(pat.internal_assessment || []),
                            ];
                            const comps = [...(sections[si].components || [])];
                            comps[ci] = {
                              ...comps[ci],
                              description: e.target.value,
                            };
                            sections[si] = {
                              ...sections[si],
                              components: comps,
                            };
                            updatePattern({
                              internal_assessment: sections,
                            });
                          }}
                        />
                        <IconPickerField
                          value={comp.icon || ""}
                          onChange={(iconUrl) => {
                            const sections = [
                              ...(pat.internal_assessment || []),
                            ];
                            const comps = [...(sections[si].components || [])];
                            comps[ci] = {
                              ...comps[ci],
                              icon: iconUrl,
                            };
                            sections[si] = {
                              ...sections[si],
                              components: comps,
                            };
                            updatePattern({
                              internal_assessment: sections,
                            });
                          }}
                        />
                        {/* Sub-components */}
                        <div className="pl-3 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              Sub-components
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => {
                                const sections = [
                                  ...(pat.internal_assessment || []),
                                ];
                                const comps = [
                                  ...(sections[si].components || []),
                                ];
                                comps[ci] = {
                                  ...comps[ci],
                                  sub_components: [
                                    ...(comps[ci].sub_components || []),
                                    {
                                      name: "",
                                      marks: 0,
                                    },
                                  ],
                                };
                                sections[si] = {
                                  ...sections[si],
                                  components: comps,
                                };
                                updatePattern({
                                  internal_assessment: sections,
                                });
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                          </div>
                          {(comp.sub_components || []).map(
                            (sc: any, sci: number) => (
                              <div
                                key={sci}
                                className="flex gap-2 items-center"
                              >
                                <Input
                                  placeholder="Sub-component name"
                                  className="h-7 text-xs"
                                  value={sc.name || ""}
                                  onChange={(e) => {
                                    const sections = [
                                      ...(pat.internal_assessment || []),
                                    ];
                                    const comps = [
                                      ...(sections[si].components || []),
                                    ];
                                    const subs = [
                                      ...(comps[ci].sub_components || []),
                                    ];
                                    subs[sci] = {
                                      ...subs[sci],
                                      name: e.target.value,
                                    };
                                    comps[ci] = {
                                      ...comps[ci],
                                      sub_components: subs,
                                    };
                                    sections[si] = {
                                      ...sections[si],
                                      components: comps,
                                    };
                                    updatePattern({
                                      internal_assessment: sections,
                                    });
                                  }}
                                />
                                <Input
                                  type="number"
                                  placeholder="Marks"
                                  className="w-16 h-7 text-xs"
                                  value={sc.marks ?? ""}
                                  onChange={(e) => {
                                    const sections = [
                                      ...(pat.internal_assessment || []),
                                    ];
                                    const comps = [
                                      ...(sections[si].components || []),
                                    ];
                                    const subs = [
                                      ...(comps[ci].sub_components || []),
                                    ];
                                    subs[sci] = {
                                      ...subs[sci],
                                      marks: Number(e.target.value),
                                    };
                                    comps[ci] = {
                                      ...comps[ci],
                                      sub_components: subs,
                                    };
                                    sections[si] = {
                                      ...sections[si],
                                      components: comps,
                                    };
                                    updatePattern({
                                      internal_assessment: sections,
                                    });
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    const sections = [
                                      ...(pat.internal_assessment || []),
                                    ];
                                    const comps = [
                                      ...(sections[si].components || []),
                                    ];
                                    comps[ci] = {
                                      ...comps[ci],
                                      sub_components: (
                                        comps[ci].sub_components || []
                                      ).filter(
                                        (_: any, i: number) => i !== sci,
                                      ),
                                    };
                                    sections[si] = {
                                      ...sections[si],
                                      components: comps,
                                    };
                                    updatePattern({
                                      internal_assessment: sections,
                                    });
                                  }}
                                >
                                  <X className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* External Examination Sections */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-sm">
                  External Examination (ESA) Sections
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updatePattern({
                      external_examination: [
                        ...(pat.external_examination || []),
                        {
                          section: "",
                          columns: ["Section", "Total Q", "Attempt", "Marks"],
                          rows: [],
                        },
                      ],
                    })
                  }
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Section
                </Button>
              </div>
              {(pat.external_examination || []).map((ext: any, ei: number) => (
                <div
                  key={ei}
                  className="border p-3 rounded-lg space-y-3 bg-muted/10"
                >
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Section name (e.g. ESA - Theory)"
                      value={ext.section || ""}
                      onChange={(e) => {
                        const next = [...(pat.external_examination || [])];
                        next[ei] = {
                          ...next[ei],
                          section: e.target.value,
                        };
                        updatePattern({
                          external_examination: next,
                        });
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updatePattern({
                          external_examination: (
                            pat.external_examination || []
                          ).filter((_: any, i: number) => i !== ei),
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Columns (comma-separated, e.g. Section, Total Q, Attempt, Marks)"
                    value={(ext.columns || []).join(", ")}
                    onChange={(e) => {
                      const next = [...(pat.external_examination || [])];
                      next[ei] = {
                        ...next[ei],
                        columns: e.target.value.split(","),
                      };
                      updatePattern({
                        external_examination: next,
                      });
                    }}
                    onBlur={(e) => {
                      const next = [...(pat.external_examination || [])];
                      next[ei] = {
                        ...next[ei],
                        columns: e.target.value
                          .split(",")
                          .map((s: string) => s.trim())
                          .filter(Boolean),
                      };
                      updatePattern({
                        external_examination: next,
                      });
                    }}
                  />
                  <div className="pl-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs text-muted-foreground">
                        Rows
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const next = [...(pat.external_examination || [])];
                          next[ei] = {
                            ...next[ei],
                            rows: [
                              ...(next[ei].rows || []),
                              {
                                section: "",
                                subtitle: "",
                                total_questions: 0,
                                attempt: 0,
                                marks: 0,
                              },
                            ],
                          };
                          updatePattern({
                            external_examination: next,
                          });
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Row
                      </Button>
                    </div>
                    {(ext.rows || []).map((row: any, ri: number) => (
                      <div
                        key={ri}
                        className="flex gap-2 items-center flex-wrap"
                      >
                        <Input
                          placeholder="Section (e.g. Section A)"
                          className="flex-1 min-w-[120px]"
                          value={row.section || ""}
                          onChange={(e) => {
                            const next = [...(pat.external_examination || [])];
                            const rows = [...(next[ei].rows || [])];
                            rows[ri] = {
                              ...rows[ri],
                              section: e.target.value,
                            };
                            next[ei] = {
                              ...next[ei],
                              rows,
                            };
                            updatePattern({
                              external_examination: next,
                            });
                          }}
                        />
                        <Input
                          placeholder="Subtitle"
                          className="flex-1 min-w-[100px]"
                          value={row.subtitle || ""}
                          onChange={(e) => {
                            const next = [...(pat.external_examination || [])];
                            const rows = [...(next[ei].rows || [])];
                            rows[ri] = {
                              ...rows[ri],
                              subtitle: e.target.value,
                            };
                            next[ei] = {
                              ...next[ei],
                              rows,
                            };
                            updatePattern({
                              external_examination: next,
                            });
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Total Q"
                          className="w-20"
                          value={row.total_questions ?? ""}
                          onChange={(e) => {
                            const next = [...(pat.external_examination || [])];
                            const rows = [...(next[ei].rows || [])];
                            rows[ri] = {
                              ...rows[ri],
                              total_questions: Number(e.target.value),
                            };
                            next[ei] = {
                              ...next[ei],
                              rows,
                            };
                            updatePattern({
                              external_examination: next,
                            });
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Attempt"
                          className="w-20"
                          value={row.attempt ?? ""}
                          onChange={(e) => {
                            const next = [...(pat.external_examination || [])];
                            const rows = [...(next[ei].rows || [])];
                            rows[ri] = {
                              ...rows[ri],
                              attempt: Number(e.target.value),
                            };
                            next[ei] = {
                              ...next[ei],
                              rows,
                            };
                            updatePattern({
                              external_examination: next,
                            });
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Marks"
                          className="w-20"
                          value={row.marks ?? ""}
                          onChange={(e) => {
                            const next = [...(pat.external_examination || [])];
                            const rows = [...(next[ei].rows || [])];
                            rows[ri] = {
                              ...rows[ri],
                              marks: Number(e.target.value),
                            };
                            next[ei] = {
                              ...next[ei],
                              rows,
                            };
                            updatePattern({
                              external_examination: next,
                            });
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const next = [...(pat.external_examination || [])];
                            next[ei] = {
                              ...next[ei],
                              rows: (next[ei].rows || []).filter(
                                (_: any, i: number) => i !== ri,
                              ),
                            };
                            updatePattern({
                              external_examination: next,
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
