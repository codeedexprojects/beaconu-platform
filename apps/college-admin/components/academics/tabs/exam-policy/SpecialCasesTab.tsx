"use client";

import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SpecialCasesTab({
  payload,
  onChange,
}: {
  payload: any;
  onChange: (updates: any) => void;
}) {
  const getActiveTabPayload = () => payload;
  const updateActiveTabPayload = (updates: any) => onChange(updates);

  return (
    <div className="space-y-8">
      {/* Projects & Dissertation */}
      <div className="border p-4 rounded-xl space-y-4 bg-muted/5">
        <h4 className="font-bold text-sm">Projects & Dissertation</h4>
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Marks Distribution Title</Label>
              <Input
                placeholder="e.g. Marks Distribution"
                value={
                  getActiveTabPayload().projects_dissertation
                    ?.marks_distribution_bar?.title || ""
                }
                onChange={(e) =>
                  updateActiveTabPayload({
                    projects_dissertation: {
                      ...(getActiveTabPayload().projects_dissertation || {}),
                      marks_distribution_bar: {
                        ...(getActiveTabPayload().projects_dissertation
                          ?.marks_distribution_bar || {}),
                        title: e.target.value,
                      },
                    },
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Total Label</Label>
              <Input
                placeholder="e.g. Total: 100"
                value={
                  getActiveTabPayload().projects_dissertation
                    ?.marks_distribution_bar?.total_label || ""
                }
                onChange={(e) =>
                  updateActiveTabPayload({
                    projects_dissertation: {
                      ...(getActiveTabPayload().projects_dissertation || {}),
                      marks_distribution_bar: {
                        ...(getActiveTabPayload().projects_dissertation
                          ?.marks_distribution_bar || {}),
                        total_label: e.target.value,
                      },
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold">
              Marks Distribution Segments
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const segs = [
                  ...(getActiveTabPayload().projects_dissertation
                    ?.marks_distribution_bar?.segments || []),
                  {
                    label: "",
                    percent: 0,
                    color: "#3B82F6",
                  },
                ];
                updateActiveTabPayload({
                  projects_dissertation: {
                    ...(getActiveTabPayload().projects_dissertation || {}),
                    marks_distribution_bar: {
                      ...(getActiveTabPayload().projects_dissertation
                        ?.marks_distribution_bar || {}),
                      segments: segs,
                    },
                  },
                });
              }}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Segment
            </Button>
          </div>
          {(
            getActiveTabPayload().projects_dissertation?.marks_distribution_bar
              ?.segments || []
          ).map((seg: any, si: number) => (
            <div key={si} className="flex gap-2 items-center">
              <Input
                placeholder="Label"
                value={seg.label || ""}
                onChange={(e) => {
                  const segs = [
                    ...(getActiveTabPayload().projects_dissertation
                      ?.marks_distribution_bar?.segments || []),
                  ];
                  segs[si] = {
                    ...segs[si],
                    label: e.target.value,
                  };
                  updateActiveTabPayload({
                    projects_dissertation: {
                      ...(getActiveTabPayload().projects_dissertation || {}),
                      marks_distribution_bar: {
                        ...(getActiveTabPayload().projects_dissertation
                          ?.marks_distribution_bar || {}),
                        segments: segs,
                      },
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
                  const segs = [
                    ...(getActiveTabPayload().projects_dissertation
                      ?.marks_distribution_bar?.segments || []),
                  ];
                  segs[si] = {
                    ...segs[si],
                    percent: e.target.value,
                  };
                  updateActiveTabPayload({
                    projects_dissertation: {
                      ...(getActiveTabPayload().projects_dissertation || {}),
                      marks_distribution_bar: {
                        ...(getActiveTabPayload().projects_dissertation
                          ?.marks_distribution_bar || {}),
                        segments: segs,
                      },
                    },
                  });
                }}
              />
              <Input
                placeholder="#color"
                className="w-28"
                value={seg.color || ""}
                onChange={(e) => {
                  const segs = [
                    ...(getActiveTabPayload().projects_dissertation
                      ?.marks_distribution_bar?.segments || []),
                  ];
                  segs[si] = {
                    ...segs[si],
                    color: e.target.value,
                  };
                  updateActiveTabPayload({
                    projects_dissertation: {
                      ...(getActiveTabPayload().projects_dissertation || {}),
                      marks_distribution_bar: {
                        ...(getActiveTabPayload().projects_dissertation
                          ?.marks_distribution_bar || {}),
                        segments: segs,
                      },
                    },
                  });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const segs = (
                    getActiveTabPayload().projects_dissertation
                      ?.marks_distribution_bar?.segments || []
                  ).filter((_: any, i: number) => i !== si);
                  updateActiveTabPayload({
                    projects_dissertation: {
                      ...(getActiveTabPayload().projects_dissertation || {}),
                      marks_distribution_bar: {
                        ...(getActiveTabPayload().projects_dissertation
                          ?.marks_distribution_bar || {}),
                        segments: segs,
                      },
                    },
                  });
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold">
              Internal Assessment Components
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const comps = [
                  ...(getActiveTabPayload().projects_dissertation
                    ?.internal_assessment?.[0]?.components || []),
                  { name: "", marks: 0 },
                ];
                updateActiveTabPayload({
                  projects_dissertation: {
                    ...(getActiveTabPayload().projects_dissertation || {}),
                    internal_assessment: [
                      {
                        section: "Components of Internal Evaluation",
                        components: comps,
                      },
                    ],
                  },
                });
              }}
            >
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
          {(
            getActiveTabPayload().projects_dissertation
              ?.internal_assessment?.[0]?.components || []
          ).map((comp: any, ci: number) => (
            <div key={ci} className="flex gap-2 items-center">
              <Input
                placeholder="Component name"
                value={comp.name || ""}
                onChange={(e) => {
                  const comps = [
                    ...(getActiveTabPayload().projects_dissertation
                      ?.internal_assessment?.[0]?.components || []),
                  ];
                  comps[ci] = {
                    ...comps[ci],
                    name: e.target.value,
                  };
                  updateActiveTabPayload({
                    projects_dissertation: {
                      ...(getActiveTabPayload().projects_dissertation || {}),
                      internal_assessment: [
                        {
                          section: "Components of Internal Evaluation",
                          components: comps,
                        },
                      ],
                    },
                  });
                }}
              />
              <Input
                type="number"
                placeholder="Marks"
                className="w-20"
                value={comp.marks ?? ""}
                onChange={(e) => {
                  const comps = [
                    ...(getActiveTabPayload().projects_dissertation
                      ?.internal_assessment?.[0]?.components || []),
                  ];
                  comps[ci] = {
                    ...comps[ci],
                    marks: e.target.value,
                  };
                  updateActiveTabPayload({
                    projects_dissertation: {
                      ...(getActiveTabPayload().projects_dissertation || {}),
                      internal_assessment: [
                        {
                          section: "Components of Internal Evaluation",
                          components: comps,
                        },
                      ],
                    },
                  });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const comps = (
                    getActiveTabPayload().projects_dissertation
                      ?.internal_assessment?.[0]?.components || []
                  ).filter((_: any, i: number) => i !== ci);
                  updateActiveTabPayload({
                    projects_dissertation: {
                      ...(getActiveTabPayload().projects_dissertation || {}),
                      internal_assessment: [
                        {
                          section: "Components of Internal Evaluation",
                          components: comps,
                        },
                      ],
                    },
                  });
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold">
              External Assessment Components
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const comps = [
                  ...(getActiveTabPayload().projects_dissertation
                    ?.external_examination?.[0]?.components || []),
                  { name: "", marks: 0 },
                ];
                updateActiveTabPayload({
                  projects_dissertation: {
                    ...(getActiveTabPayload().projects_dissertation || {}),
                    external_examination: [
                      {
                        section: "Components of External Assessment",
                        components: comps,
                      },
                    ],
                  },
                });
              }}
            >
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
          {(
            getActiveTabPayload().projects_dissertation
              ?.external_examination?.[0]?.components || []
          ).map((comp: any, ci: number) => (
            <div key={ci} className="flex gap-2 items-center">
              <Input
                placeholder="Component name"
                value={comp.name || ""}
                onChange={(e) => {
                  const comps = [
                    ...(getActiveTabPayload().projects_dissertation
                      ?.external_examination?.[0]?.components || []),
                  ];
                  comps[ci] = {
                    ...comps[ci],
                    name: e.target.value,
                  };
                  updateActiveTabPayload({
                    projects_dissertation: {
                      ...(getActiveTabPayload().projects_dissertation || {}),
                      external_examination: [
                        {
                          section: "Components of External Assessment",
                          components: comps,
                        },
                      ],
                    },
                  });
                }}
              />
              <Input
                type="number"
                placeholder="Marks"
                className="w-20"
                value={comp.marks ?? ""}
                onChange={(e) => {
                  const comps = [
                    ...(getActiveTabPayload().projects_dissertation
                      ?.external_examination?.[0]?.components || []),
                  ];
                  comps[ci] = {
                    ...comps[ci],
                    marks: e.target.value,
                  };
                  updateActiveTabPayload({
                    projects_dissertation: {
                      ...(getActiveTabPayload().projects_dissertation || {}),
                      external_examination: [
                        {
                          section: "Components of External Assessment",
                          components: comps,
                        },
                      ],
                    },
                  });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const comps = (
                    getActiveTabPayload().projects_dissertation
                      ?.external_examination?.[0]?.components || []
                  ).filter((_: any, i: number) => i !== ci);
                  updateActiveTabPayload({
                    projects_dissertation: {
                      ...(getActiveTabPayload().projects_dissertation || {}),
                      external_examination: [
                        {
                          section: "Components of External Assessment",
                          components: comps,
                        },
                      ],
                    },
                  });
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold">Summary Cards</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const cards = [
                  ...(getActiveTabPayload().projects_dissertation
                    ?.summary_cards || []),
                  { label: "", value: "" },
                ];
                updateActiveTabPayload({
                  projects_dissertation: {
                    ...(getActiveTabPayload().projects_dissertation || {}),
                    summary_cards: cards,
                  },
                });
              }}
            >
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
          {(
            getActiveTabPayload().projects_dissertation?.summary_cards || []
          ).map((sc: any, si: number) => (
            <div key={si} className="flex gap-2 items-center">
              <Input
                placeholder="Label"
                value={sc.label || ""}
                onChange={(e) => {
                  const cards = [
                    ...(getActiveTabPayload().projects_dissertation
                      ?.summary_cards || []),
                  ];
                  cards[si] = {
                    ...cards[si],
                    label: e.target.value,
                  };
                  updateActiveTabPayload({
                    projects_dissertation: {
                      ...(getActiveTabPayload().projects_dissertation || {}),
                      summary_cards: cards,
                    },
                  });
                }}
              />
              <Input
                placeholder="Value (e.g. 30 Marks)"
                value={sc.value || ""}
                onChange={(e) => {
                  const cards = [
                    ...(getActiveTabPayload().projects_dissertation
                      ?.summary_cards || []),
                  ];
                  cards[si] = {
                    ...cards[si],
                    value: e.target.value,
                  };
                  updateActiveTabPayload({
                    projects_dissertation: {
                      ...(getActiveTabPayload().projects_dissertation || {}),
                      summary_cards: cards,
                    },
                  });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const cards = (
                    getActiveTabPayload().projects_dissertation
                      ?.summary_cards || []
                  ).filter((_: any, i: number) => i !== si);
                  updateActiveTabPayload({
                    projects_dissertation: {
                      ...(getActiveTabPayload().projects_dissertation || {}),
                      summary_cards: cards,
                    },
                  });
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* OJT Evaluation */}
      <div className="border p-4 rounded-xl space-y-4 bg-muted/5">
        <h4 className="font-bold text-sm">OJT Evaluation</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Section Title</Label>
            <Input
              placeholder="e.g. OJT ASSESSMENT CRITERIA"
              value={getActiveTabPayload().ojt_evaluation?.section_title || ""}
              onChange={(e) =>
                updateActiveTabPayload({
                  ojt_evaluation: {
                    ...(getActiveTabPayload().ojt_evaluation || {}),
                    section_title: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Total Summary Label</Label>
            <Input
              placeholder="e.g. TOTAL ASSESSMENT"
              value={
                getActiveTabPayload().ojt_evaluation?.total_summary?.label || ""
              }
              onChange={(e) =>
                updateActiveTabPayload({
                  ojt_evaluation: {
                    ...(getActiveTabPayload().ojt_evaluation || {}),
                    total_summary: {
                      ...(getActiveTabPayload().ojt_evaluation?.total_summary ||
                        {}),
                      label: e.target.value,
                    },
                  },
                })
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Total Summary Value</Label>
            <Input
              placeholder="e.g. 100 Marks"
              value={
                getActiveTabPayload().ojt_evaluation?.total_summary?.value || ""
              }
              onChange={(e) =>
                updateActiveTabPayload({
                  ojt_evaluation: {
                    ...(getActiveTabPayload().ojt_evaluation || {}),
                    total_summary: {
                      ...(getActiveTabPayload().ojt_evaluation?.total_summary ||
                        {}),
                      value: e.target.value,
                    },
                  },
                })
              }
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs">Table Columns (comma-separated)</Label>
            <Input
              placeholder="e.g. Criterion, Marks"
              value={(getActiveTabPayload().ojt_evaluation?.columns || []).join(
                ", ",
              )}
              onChange={(e) =>
                updateActiveTabPayload({
                  ojt_evaluation: {
                    ...(getActiveTabPayload().ojt_evaluation || {}),
                    columns: e.target.value.split(","),
                  },
                })
              }
              onBlur={(e) =>
                updateActiveTabPayload({
                  ojt_evaluation: {
                    ...(getActiveTabPayload().ojt_evaluation || {}),
                    columns: e.target.value
                      .split(",")
                      .map((s: string) => s.trim())
                      .filter(Boolean),
                  },
                })
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold">Criteria Components</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const comps = [
                  ...(getActiveTabPayload().ojt_evaluation?.components || []),
                  { name: "", marks: 0 },
                ];
                updateActiveTabPayload({
                  ojt_evaluation: {
                    ...(getActiveTabPayload().ojt_evaluation || {}),
                    components: comps,
                  },
                });
              }}
            >
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
          {(getActiveTabPayload().ojt_evaluation?.components || []).map(
            (comp: any, ci: number) => (
              <div key={ci} className="flex gap-2 items-center">
                <Input
                  placeholder="Criterion name"
                  value={comp.name || ""}
                  onChange={(e) => {
                    const comps = [
                      ...(getActiveTabPayload().ojt_evaluation?.components ||
                        []),
                    ];
                    comps[ci] = {
                      ...comps[ci],
                      name: e.target.value,
                    };
                    updateActiveTabPayload({
                      ojt_evaluation: {
                        ...(getActiveTabPayload().ojt_evaluation || {}),
                        components: comps,
                      },
                    });
                  }}
                />
                <Input
                  type="number"
                  placeholder="Marks"
                  className="w-20"
                  value={comp.marks ?? ""}
                  onChange={(e) => {
                    const comps = [
                      ...(getActiveTabPayload().ojt_evaluation?.components ||
                        []),
                    ];
                    comps[ci] = {
                      ...comps[ci],
                      marks: e.target.value,
                    };
                    updateActiveTabPayload({
                      ojt_evaluation: {
                        ...(getActiveTabPayload().ojt_evaluation || {}),
                        components: comps,
                      },
                    });
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const comps = (
                      getActiveTabPayload().ojt_evaluation?.components || []
                    ).filter((_: any, i: number) => i !== ci);
                    updateActiveTabPayload({
                      ojt_evaluation: {
                        ...(getActiveTabPayload().ojt_evaluation || {}),
                        components: comps,
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

      {/* Internship Evaluation */}
      <div className="border p-4 rounded-xl space-y-4 bg-muted/5">
        <h4 className="font-bold text-sm">Internship Evaluation</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Section Title</Label>
            <Input
              placeholder="e.g. COMPONENTS OF INTERNSHIP EVALUATION"
              value={
                getActiveTabPayload().internship_evaluation?.section_title || ""
              }
              onChange={(e) =>
                updateActiveTabPayload({
                  internship_evaluation: {
                    ...(getActiveTabPayload().internship_evaluation || {}),
                    section_title: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Total Summary Label</Label>
            <Input
              placeholder="e.g. TOTAL EVALUATION"
              value={
                getActiveTabPayload().internship_evaluation?.total_summary
                  ?.label || ""
              }
              onChange={(e) =>
                updateActiveTabPayload({
                  internship_evaluation: {
                    ...(getActiveTabPayload().internship_evaluation || {}),
                    total_summary: {
                      ...(getActiveTabPayload().internship_evaluation
                        ?.total_summary || {}),
                      label: e.target.value,
                    },
                  },
                })
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Total Summary Value</Label>
            <Input
              placeholder="e.g. 100 Marks"
              value={
                getActiveTabPayload().internship_evaluation?.total_summary
                  ?.value || ""
              }
              onChange={(e) =>
                updateActiveTabPayload({
                  internship_evaluation: {
                    ...(getActiveTabPayload().internship_evaluation || {}),
                    total_summary: {
                      ...(getActiveTabPayload().internship_evaluation
                        ?.total_summary || {}),
                      value: e.target.value,
                    },
                  },
                })
              }
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs">Table Columns (comma-separated)</Label>
            <Input
              placeholder="e.g. Component, Marks"
              value={(
                getActiveTabPayload().internship_evaluation?.columns || []
              ).join(", ")}
              onChange={(e) =>
                updateActiveTabPayload({
                  internship_evaluation: {
                    ...(getActiveTabPayload().internship_evaluation || {}),
                    columns: e.target.value.split(","),
                  },
                })
              }
              onBlur={(e) =>
                updateActiveTabPayload({
                  internship_evaluation: {
                    ...(getActiveTabPayload().internship_evaluation || {}),
                    columns: e.target.value
                      .split(",")
                      .map((s: string) => s.trim())
                      .filter(Boolean),
                  },
                })
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold">
              Internship Components
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const comps = [
                  ...(getActiveTabPayload().internship_evaluation?.components ||
                    []),
                  { name: "", marks: 0 },
                ];
                updateActiveTabPayload({
                  internship_evaluation: {
                    ...(getActiveTabPayload().internship_evaluation || {}),
                    components: comps,
                  },
                });
              }}
            >
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
          {(getActiveTabPayload().internship_evaluation?.components || []).map(
            (comp: any, ci: number) => (
              <div key={ci} className="flex gap-2 items-center">
                <Input
                  placeholder="Component name"
                  value={comp.name || ""}
                  onChange={(e) => {
                    const comps = [
                      ...(getActiveTabPayload().internship_evaluation
                        ?.components || []),
                    ];
                    comps[ci] = {
                      ...comps[ci],
                      name: e.target.value,
                    };
                    updateActiveTabPayload({
                      internship_evaluation: {
                        ...(getActiveTabPayload().internship_evaluation || {}),
                        components: comps,
                      },
                    });
                  }}
                />
                <Input
                  type="number"
                  placeholder="Marks"
                  className="w-20"
                  value={comp.marks ?? ""}
                  onChange={(e) => {
                    const comps = [
                      ...(getActiveTabPayload().internship_evaluation
                        ?.components || []),
                    ];
                    comps[ci] = {
                      ...comps[ci],
                      marks: e.target.value,
                    };
                    updateActiveTabPayload({
                      internship_evaluation: {
                        ...(getActiveTabPayload().internship_evaluation || {}),
                        components: comps,
                      },
                    });
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const comps = (
                      getActiveTabPayload().internship_evaluation?.components ||
                      []
                    ).filter((_: any, i: number) => i !== ci);
                    updateActiveTabPayload({
                      internship_evaluation: {
                        ...(getActiveTabPayload().internship_evaluation || {}),
                        components: comps,
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
    </div>
  );
}
