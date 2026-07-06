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
import { Button } from "@/components/ui/button";

export function EligibilityCriteriaTab({
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
      {/* Indian Students — quotas, each with its own criteria */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-indigo-950">
              Indian Students
            </CardTitle>
            <CardDescription>
              Add a quota category (e.g. General, Management, NRI) — each quota
              has its own eligibility criteria.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const quotas = getActiveTabPayload().indian_student?.quotas || [];
              updateActiveTabPayload({
                indian_student: {
                  ...(getActiveTabPayload().indian_student || {}),
                  quotas: [...quotas, { id: "", label: "", criteria: [] }],
                },
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Quota
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(getActiveTabPayload().indian_student?.quotas || []).length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No quotas added yet.
            </p>
          ) : (
            (getActiveTabPayload().indian_student?.quotas || []).map(
              (quota: any, qIdx: number) => {
                const updateQuota = (patch: Record<string, unknown>) => {
                  const quotas = [
                    ...(getActiveTabPayload().indian_student?.quotas || []),
                  ];
                  quotas[qIdx] = {
                    ...quotas[qIdx],
                    ...patch,
                  };
                  updateActiveTabPayload({
                    indian_student: {
                      ...(getActiveTabPayload().indian_student || {}),
                      quotas,
                    },
                  });
                };
                const removeQuota = () => {
                  const quotas = (
                    getActiveTabPayload().indian_student?.quotas || []
                  ).filter((_: any, i: number) => i !== qIdx);
                  updateActiveTabPayload({
                    indian_student: {
                      ...(getActiveTabPayload().indian_student || {}),
                      quotas,
                    },
                  });
                };
                const updateCriterion = (
                  cIdx: number,
                  patch: Record<string, unknown>,
                ) => {
                  const criteria = [...(quota.criteria || [])];
                  criteria[cIdx] = {
                    ...criteria[cIdx],
                    ...patch,
                  };
                  updateQuota({ criteria });
                };
                const removeCriterion = (cIdx: number) => {
                  updateQuota({
                    criteria: (quota.criteria || []).filter(
                      (_: any, i: number) => i !== cIdx,
                    ),
                  });
                };
                return (
                  <div
                    key={qIdx}
                    className="border p-3 rounded-lg space-y-3 bg-muted/5"
                  >
                    <div className="flex gap-2 items-center">
                      <Input
                        className="flex-1"
                        placeholder="Quota Label (e.g. General, Management Quota)"
                        value={quota.label || ""}
                        onChange={(e) =>
                          updateQuota({
                            label: e.target.value,
                          })
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeQuota}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="space-y-2 pl-2 border-l-2">
                      {(quota.criteria || []).map((crit: any, cIdx: number) => (
                        <div key={cIdx} className="flex gap-2 items-start">
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="Heading (e.g. Minimum Marks)"
                              value={crit.heading || ""}
                              onChange={(e) =>
                                updateCriterion(cIdx, {
                                  heading: e.target.value,
                                })
                              }
                            />
                            <Input
                              placeholder="Description (e.g. 60% aggregate in 10+2 with PCM)"
                              value={crit.description || ""}
                              onChange={(e) =>
                                updateCriterion(cIdx, {
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCriterion(cIdx)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateQuota({
                            criteria: [
                              ...(quota.criteria || []),
                              {
                                heading: "",
                                description: "",
                              },
                            ],
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Criterion
                      </Button>
                    </div>
                  </div>
                );
              },
            )
          )}
        </CardContent>
      </Card>

      {/* Foreign Students — no quota concept, one shared criteria list */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-indigo-950">
              Foreign Students
            </CardTitle>
            <CardDescription>
              Eligibility criteria shown to foreign students for this course (no
              quota selection needed).
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const criteria =
                getActiveTabPayload().foreign_student?.criteria || [];
              updateActiveTabPayload({
                foreign_student: {
                  ...(getActiveTabPayload().foreign_student || {}),
                  criteria: [...criteria, { heading: "", description: "" }],
                },
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Criterion
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {(getActiveTabPayload().foreign_student?.criteria || []).length ===
          0 ? (
            <p className="text-xs text-muted-foreground italic">
              No eligibility criteria added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {(getActiveTabPayload().foreign_student?.criteria || []).map(
                (crit: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex gap-2 items-start border p-3 rounded-lg bg-muted/5"
                  >
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Heading (e.g. Minimum Marks)"
                        value={crit.heading || ""}
                        onChange={(e) => {
                          const criteria = [
                            ...(getActiveTabPayload().foreign_student
                              ?.criteria || []),
                          ];
                          criteria[idx] = {
                            ...criteria[idx],
                            heading: e.target.value,
                          };
                          updateActiveTabPayload({
                            foreign_student: {
                              ...(getActiveTabPayload().foreign_student || {}),
                              criteria,
                            },
                          });
                        }}
                      />
                      <Input
                        placeholder="Description (e.g. 60% aggregate in 10+2 with PCM)"
                        value={crit.description || ""}
                        onChange={(e) => {
                          const criteria = [
                            ...(getActiveTabPayload().foreign_student
                              ?.criteria || []),
                          ];
                          criteria[idx] = {
                            ...criteria[idx],
                            description: e.target.value,
                          };
                          updateActiveTabPayload({
                            foreign_student: {
                              ...(getActiveTabPayload().foreign_student || {}),
                              criteria,
                            },
                          });
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const criteria = (
                          getActiveTabPayload().foreign_student?.criteria || []
                        ).filter((_: any, i: number) => i !== idx);
                        updateActiveTabPayload({
                          foreign_student: {
                            ...(getActiveTabPayload().foreign_student || {}),
                            criteria,
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
