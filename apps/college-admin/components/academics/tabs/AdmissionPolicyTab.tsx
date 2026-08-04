"use client";

import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdmissionPolicyTab({
  payload,
  onChange,
}: {
  payload: any;
  onChange: (updates: any) => void;
}) {
  const getActiveTabPayload = () => payload;
  const updateActiveTabPayload = (updates: any) => onChange(updates);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Section Title</Label>
          <Input
            placeholder="e.g. Admission Policy"
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
            className="h-4 w-4 accent-primary"
            checked={getActiveTabPayload().enabled ?? true}
            onChange={(e) =>
              updateActiveTabPayload({
                enabled: e.target.checked,
              })
            }
          />
        </div>
      </div>

      <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-sm text-foreground">Seat Matrix</h4>
            <p className="text-xs text-muted-foreground">
              Total and open seats split by quota/category.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const sm = getActiveTabPayload().seat_matrix || {};
              const rows = Array.isArray((sm as any).rows)
                ? (sm as any).rows
                : [];
              updateActiveTabPayload({
                seat_matrix: {
                  ...(sm as any),
                  rows: [
                    ...rows,
                    {
                      quota_category: "",
                      total: "",
                      open: "",
                    },
                  ],
                },
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Row
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Table Title</Label>
            <Input
              placeholder="e.g. Seat Matrix"
              value={(getActiveTabPayload().seat_matrix as any)?.title || ""}
              onChange={(e) =>
                updateActiveTabPayload({
                  seat_matrix: {
                    ...((getActiveTabPayload().seat_matrix as any) || {}),
                    title: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Columns (comma-separated)</Label>
            <Input
              placeholder="Quota Category, Total, Open"
              value={
                Array.isArray(
                  (getActiveTabPayload().seat_matrix as any)?.columns,
                )
                  ? (getActiveTabPayload().seat_matrix as any).columns.join(
                      ", ",
                    )
                  : ""
              }
              onChange={(e) =>
                updateActiveTabPayload({
                  seat_matrix: {
                    ...((getActiveTabPayload().seat_matrix as any) || {}),
                    columns: e.target.value.split(","),
                  },
                })
              }
              onBlur={(e) =>
                updateActiveTabPayload({
                  seat_matrix: {
                    ...((getActiveTabPayload().seat_matrix as any) || {}),
                    columns: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },
                })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          {(Array.isArray((getActiveTabPayload().seat_matrix as any)?.rows)
            ? (getActiveTabPayload().seat_matrix as any).rows
            : []
          ).map((row: any, idx: number) => (
            <div
              key={idx}
              className="flex gap-2 items-center border p-2 rounded-lg bg-muted/5"
            >
              <Input
                className="flex-1"
                placeholder="Quota Category (e.g. Government)"
                value={row.quota_category || ""}
                onChange={(e) => {
                  const rows = [
                    ...((getActiveTabPayload().seat_matrix as any)?.rows || []),
                  ];
                  rows[idx] = {
                    ...rows[idx],
                    quota_category: e.target.value,
                  };
                  updateActiveTabPayload({
                    seat_matrix: {
                      ...((getActiveTabPayload().seat_matrix as any) || {}),
                      rows,
                    },
                  });
                }}
              />
              <Input
                className="w-28"
                type="number"
                placeholder="Total"
                value={row.total ?? ""}
                onChange={(e) => {
                  const rows = [
                    ...((getActiveTabPayload().seat_matrix as any)?.rows || []),
                  ];
                  rows[idx] = {
                    ...rows[idx],
                    total: e.target.value,
                  };
                  updateActiveTabPayload({
                    seat_matrix: {
                      ...((getActiveTabPayload().seat_matrix as any) || {}),
                      rows,
                    },
                  });
                }}
              />
              <Input
                className="w-28"
                type="number"
                placeholder="Open"
                value={row.open ?? ""}
                onChange={(e) => {
                  const rows = [
                    ...((getActiveTabPayload().seat_matrix as any)?.rows || []),
                  ];
                  rows[idx] = {
                    ...rows[idx],
                    open: e.target.value,
                  };
                  updateActiveTabPayload({
                    seat_matrix: {
                      ...((getActiveTabPayload().seat_matrix as any) || {}),
                      rows,
                    },
                  });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const rows = (
                    (getActiveTabPayload().seat_matrix as any)?.rows || []
                  ).filter((_: any, i: number) => i !== idx);
                  updateActiveTabPayload({
                    seat_matrix: {
                      ...((getActiveTabPayload().seat_matrix as any) || {}),
                      rows,
                    },
                  });
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {!(getActiveTabPayload().seat_matrix as any)?.rows?.length && (
            <p className="text-xs text-muted-foreground italic">
              No seat rows added yet.
            </p>
          )}
        </div>
      </div>

      <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-sm text-foreground">
              Entrance Exams Accepted
            </h4>
            <p className="text-xs text-muted-foreground">
              Group exams by level (National, State, Institutional).
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const ee = getActiveTabPayload().entrance_exams_accepted || {};
              const levels = Array.isArray((ee as any).levels)
                ? (ee as any).levels
                : [];
              updateActiveTabPayload({
                entrance_exams_accepted: {
                  ...(ee as any),
                  levels: [...levels, { level_label: "", exams: [] }],
                },
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Level
          </Button>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Section Title</Label>
          <Input
            placeholder="e.g. Entrance Exams Accepted"
            value={
              (getActiveTabPayload().entrance_exams_accepted as any)?.title ||
              ""
            }
            onChange={(e) =>
              updateActiveTabPayload({
                entrance_exams_accepted: {
                  ...((getActiveTabPayload().entrance_exams_accepted as any) ||
                    {}),
                  title: e.target.value,
                },
              })
            }
          />
        </div>
        <div className="space-y-4">
          {(Array.isArray(
            (getActiveTabPayload().entrance_exams_accepted as any)?.levels,
          )
            ? (getActiveTabPayload().entrance_exams_accepted as any).levels
            : []
          ).map((level: any, li: number) => (
            <div
              key={li}
              className="border rounded-lg p-3 space-y-3 bg-background"
            >
              <div className="flex gap-2 items-center">
                <Input
                  className="flex-1"
                  placeholder="Level Label (e.g. NATIONAL LEVEL)"
                  value={level.level_label || ""}
                  onChange={(e) => {
                    const levels = [
                      ...((getActiveTabPayload().entrance_exams_accepted as any)
                        ?.levels || []),
                    ];
                    levels[li] = {
                      ...levels[li],
                      level_label: e.target.value,
                    };
                    updateActiveTabPayload({
                      entrance_exams_accepted: {
                        ...((getActiveTabPayload()
                          .entrance_exams_accepted as any) || {}),
                        levels,
                      },
                    });
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const levels = [
                      ...((getActiveTabPayload().entrance_exams_accepted as any)
                        ?.levels || []),
                    ];
                    const exams = Array.isArray(levels[li].exams)
                      ? levels[li].exams
                      : [];
                    levels[li] = {
                      ...levels[li],
                      exams: [
                        ...exams,
                        {
                          name: "",
                          exam_code: "",
                          code_badge: "",
                          min_criteria_label: "",
                          min_criteria_value: "",
                        },
                      ],
                    };
                    updateActiveTabPayload({
                      entrance_exams_accepted: {
                        ...((getActiveTabPayload()
                          .entrance_exams_accepted as any) || {}),
                        levels,
                      },
                    });
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Exam
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const levels = (
                      (getActiveTabPayload().entrance_exams_accepted as any)
                        ?.levels || []
                    ).filter((_: any, i: number) => i !== li);
                    updateActiveTabPayload({
                      entrance_exams_accepted: {
                        ...((getActiveTabPayload()
                          .entrance_exams_accepted as any) || {}),
                        levels,
                      },
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="space-y-2 pl-2">
                {(Array.isArray(level.exams) ? level.exams : []).map(
                  (exam: any, ei: number) => (
                    <div
                      key={ei}
                      className="border rounded-lg p-3 space-y-2 bg-muted/5"
                    >
                      <div className="grid gap-2 md:grid-cols-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Exam Name</Label>
                          <Input
                            placeholder="e.g. Common Admission Test"
                            value={exam.name || ""}
                            onChange={(e) => {
                              const levels = [
                                ...((
                                  getActiveTabPayload()
                                    .entrance_exams_accepted as any
                                )?.levels || []),
                              ];
                              const exams = [...(levels[li].exams || [])];
                              exams[ei] = {
                                ...exams[ei],
                                name: e.target.value,
                              };
                              levels[li] = {
                                ...levels[li],
                                exams,
                              };
                              updateActiveTabPayload({
                                entrance_exams_accepted: {
                                  ...((getActiveTabPayload()
                                    .entrance_exams_accepted as any) || {}),
                                  levels,
                                },
                              });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Exam Code</Label>
                          <Input
                            placeholder="e.g. CAT-105"
                            value={exam.exam_code || ""}
                            onChange={(e) => {
                              const levels = [
                                ...((
                                  getActiveTabPayload()
                                    .entrance_exams_accepted as any
                                )?.levels || []),
                              ];
                              const exams = [...(levels[li].exams || [])];
                              exams[ei] = {
                                ...exams[ei],
                                exam_code: e.target.value,
                              };
                              levels[li] = {
                                ...levels[li],
                                exams,
                              };
                              updateActiveTabPayload({
                                entrance_exams_accepted: {
                                  ...((getActiveTabPayload()
                                    .entrance_exams_accepted as any) || {}),
                                  levels,
                                },
                              });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Code Badge</Label>
                          <Input
                            placeholder="e.g. CAT"
                            value={exam.code_badge || ""}
                            onChange={(e) => {
                              const levels = [
                                ...((
                                  getActiveTabPayload()
                                    .entrance_exams_accepted as any
                                )?.levels || []),
                              ];
                              const exams = [...(levels[li].exams || [])];
                              exams[ei] = {
                                ...exams[ei],
                                code_badge: e.target.value,
                              };
                              levels[li] = {
                                ...levels[li],
                                exams,
                              };
                              updateActiveTabPayload({
                                entrance_exams_accepted: {
                                  ...((getActiveTabPayload()
                                    .entrance_exams_accepted as any) || {}),
                                  levels,
                                },
                              });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Min Criteria Label</Label>
                          <Input
                            placeholder="e.g. Min. Percentile"
                            value={exam.min_criteria_label || ""}
                            onChange={(e) => {
                              const levels = [
                                ...((
                                  getActiveTabPayload()
                                    .entrance_exams_accepted as any
                                )?.levels || []),
                              ];
                              const exams = [...(levels[li].exams || [])];
                              exams[ei] = {
                                ...exams[ei],
                                min_criteria_label: e.target.value,
                              };
                              levels[li] = {
                                ...levels[li],
                                exams,
                              };
                              updateActiveTabPayload({
                                entrance_exams_accepted: {
                                  ...((getActiveTabPayload()
                                    .entrance_exams_accepted as any) || {}),
                                  levels,
                                },
                              });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Min Criteria Value</Label>
                          <Input
                            placeholder="e.g. 85%ile"
                            value={exam.min_criteria_value || ""}
                            onChange={(e) => {
                              const levels = [
                                ...((
                                  getActiveTabPayload()
                                    .entrance_exams_accepted as any
                                )?.levels || []),
                              ];
                              const exams = [...(levels[li].exams || [])];
                              exams[ei] = {
                                ...exams[ei],
                                min_criteria_value: e.target.value,
                              };
                              levels[li] = {
                                ...levels[li],
                                exams,
                              };
                              updateActiveTabPayload({
                                entrance_exams_accepted: {
                                  ...((getActiveTabPayload()
                                    .entrance_exams_accepted as any) || {}),
                                  levels,
                                },
                              });
                            }}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const levels = [
                                ...((
                                  getActiveTabPayload()
                                    .entrance_exams_accepted as any
                                )?.levels || []),
                              ];
                              const exams = (levels[li].exams || []).filter(
                                (_: any, i: number) => i !== ei,
                              );
                              levels[li] = {
                                ...levels[li],
                                exams,
                              };
                              updateActiveTabPayload({
                                entrance_exams_accepted: {
                                  ...((getActiveTabPayload()
                                    .entrance_exams_accepted as any) || {}),
                                  levels,
                                },
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ),
                )}
                {!level.exams?.length && (
                  <p className="text-xs text-muted-foreground italic pl-1">
                    No exams added for this level yet.
                  </p>
                )}
              </div>
            </div>
          ))}
          {!(getActiveTabPayload().entrance_exams_accepted as any)?.levels
            ?.length && (
            <p className="text-xs text-muted-foreground italic">
              No exam levels added yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
