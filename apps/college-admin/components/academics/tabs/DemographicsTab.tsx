"use client";

import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PercentTotalBadge } from "@/components/academics/shared/PercentTotalBadge";
import { ImageUpload } from "@/components/ui/image-upload";

export function DemographicsTab({
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
      {/* Age Distribution */}
      <div className="space-y-3 border rounded-lg p-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Age Distribution</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const items = getActiveTabPayload().age_distribution?.items || [];
              updateActiveTabPayload({
                age_distribution: {
                  ...(getActiveTabPayload().age_distribution || {}),
                  items: [...items, { label: "", percent: "" }],
                },
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        <PercentTotalBadge
          items={getActiveTabPayload().age_distribution?.items || []}
        />
        {(getActiveTabPayload().age_distribution?.items || []).map(
          (item: any, idx: number) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input
                className="flex-1"
                placeholder="e.g. 18 - 22 years"
                value={item.label || ""}
                onChange={(e) => {
                  const next = [
                    ...(getActiveTabPayload().age_distribution?.items || []),
                  ];
                  next[idx] = {
                    ...next[idx],
                    label: e.target.value,
                  };
                  updateActiveTabPayload({
                    age_distribution: {
                      ...(getActiveTabPayload().age_distribution || {}),
                      items: next,
                    },
                  });
                }}
              />
              <Input
                type="number"
                className="w-24"
                placeholder="% e.g. 64"
                value={item.percent ?? ""}
                onChange={(e) => {
                  const next = [
                    ...(getActiveTabPayload().age_distribution?.items || []),
                  ];
                  next[idx] = {
                    ...next[idx],
                    percent: e.target.value,
                  };
                  updateActiveTabPayload({
                    age_distribution: {
                      ...(getActiveTabPayload().age_distribution || {}),
                      items: next,
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
                    getActiveTabPayload().age_distribution?.items || []
                  ).filter((_: any, i: number) => i !== idx);
                  updateActiveTabPayload({
                    age_distribution: {
                      ...(getActiveTabPayload().age_distribution || {}),
                      items: next,
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

      {/* Gender Diversity */}
      <div className="space-y-3 border rounded-lg p-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Gender Diversity</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const segs =
                getActiveTabPayload().gender_diversity?.segments || [];
              updateActiveTabPayload({
                gender_diversity: {
                  ...(getActiveTabPayload().gender_diversity || {}),
                  segments: [...segs, { label: "", percent: "" }],
                },
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        <PercentTotalBadge
          items={getActiveTabPayload().gender_diversity?.segments || []}
        />
        {(getActiveTabPayload().gender_diversity?.segments || []).map(
          (seg: any, idx: number) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input
                className="flex-1"
                placeholder="e.g. Male"
                value={seg.label || ""}
                onChange={(e) => {
                  const next = [
                    ...(getActiveTabPayload().gender_diversity?.segments || []),
                  ];
                  next[idx] = {
                    ...next[idx],
                    label: e.target.value,
                  };
                  updateActiveTabPayload({
                    gender_diversity: {
                      ...(getActiveTabPayload().gender_diversity || {}),
                      segments: next,
                    },
                  });
                }}
              />
              <Input
                type="number"
                className="w-24"
                placeholder="% e.g. 60"
                value={seg.percent ?? ""}
                onChange={(e) => {
                  const next = [
                    ...(getActiveTabPayload().gender_diversity?.segments || []),
                  ];
                  next[idx] = {
                    ...next[idx],
                    percent: e.target.value,
                  };
                  updateActiveTabPayload({
                    gender_diversity: {
                      ...(getActiveTabPayload().gender_diversity || {}),
                      segments: next,
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
                    getActiveTabPayload().gender_diversity?.segments || []
                  ).filter((_: any, i: number) => i !== idx);
                  updateActiveTabPayload({
                    gender_diversity: {
                      ...(getActiveTabPayload().gender_diversity || {}),
                      segments: next,
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

      {/* Work Experience */}
      <div className="space-y-3 border rounded-lg p-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Work Experience</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const items = getActiveTabPayload().work_experience?.items || [];
              updateActiveTabPayload({
                work_experience: {
                  ...(getActiveTabPayload().work_experience || {}),
                  items: [
                    ...items,
                    {
                      icon: "",
                      label: "",
                      subtitle: "",
                      percent: "",
                    },
                  ],
                },
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        <PercentTotalBadge
          items={getActiveTabPayload().work_experience?.items || []}
        />
        {(getActiveTabPayload().work_experience?.items || []).map(
          (item: any, idx: number) => {
            const updateWe = (patch: Record<string, unknown>) => {
              const next = [
                ...(getActiveTabPayload().work_experience?.items || []),
              ];
              next[idx] = { ...next[idx], ...patch };
              updateActiveTabPayload({
                work_experience: {
                  ...(getActiveTabPayload().work_experience || {}),
                  items: next,
                },
              });
            };
            return (
              <div
                key={idx}
                className="border p-3 rounded-lg space-y-2 bg-muted/5"
              >
                <div className="flex gap-2 items-center">
                  <Input
                    className="flex-1"
                    placeholder="Label (e.g. Freshers)"
                    value={item.label || ""}
                    onChange={(e) => updateWe({ label: e.target.value })}
                  />
                  <Input
                    type="number"
                    className="w-24"
                    placeholder="% e.g. 45"
                    value={item.percent ?? ""}
                    onChange={(e) => updateWe({ percent: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const next = (
                        getActiveTabPayload().work_experience?.items || []
                      ).filter((_: any, i: number) => i !== idx);
                      updateActiveTabPayload({
                        work_experience: {
                          ...(getActiveTabPayload().work_experience || {}),
                          items: next,
                        },
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <Input
                  placeholder="Subtitle (e.g. Directly after undergrad)"
                  value={item.subtitle || ""}
                  onChange={(e) => updateWe({ subtitle: e.target.value })}
                />
                <ImageUpload
                  value={item.icon || ""}
                  onChange={(url) => updateWe({ icon: url })}
                  context={`demographics/work-experience-icon-${idx}`}
                />
              </div>
            );
          },
        )}
      </div>

      {/* International Presence */}
      <div className="space-y-3 border rounded-lg p-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold">International Presence</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const items =
                getActiveTabPayload().international_presence?.items || [];
              updateActiveTabPayload({
                international_presence: {
                  ...(getActiveTabPayload().international_presence || {}),
                  items: [...items, { flag: "", country: "", percent: "" }],
                },
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Country
          </Button>
        </div>
        <PercentTotalBadge
          items={getActiveTabPayload().international_presence?.items || []}
        />
        {(getActiveTabPayload().international_presence?.items || []).map(
          (item: any, idx: number) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input
                className="flex-1"
                placeholder="Country (e.g. India)"
                value={item.country || ""}
                onChange={(e) => {
                  const next = [
                    ...(getActiveTabPayload().international_presence?.items ||
                      []),
                  ];
                  next[idx] = {
                    ...next[idx],
                    country: e.target.value,
                  };
                  updateActiveTabPayload({
                    international_presence: {
                      ...(getActiveTabPayload().international_presence || {}),
                      items: next,
                    },
                  });
                }}
              />
              <Input
                type="number"
                className="w-24"
                placeholder="% e.g. 42"
                value={item.percent ?? ""}
                onChange={(e) => {
                  const next = [
                    ...(getActiveTabPayload().international_presence?.items ||
                      []),
                  ];
                  next[idx] = {
                    ...next[idx],
                    percent: e.target.value,
                  };
                  updateActiveTabPayload({
                    international_presence: {
                      ...(getActiveTabPayload().international_presence || {}),
                      items: next,
                    },
                  });
                }}
              />
              <ImageUpload
                className="flex-1"
                value={item.flag || ""}
                onChange={(url) => {
                  const next = [
                    ...(getActiveTabPayload().international_presence?.items ||
                      []),
                  ];
                  next[idx] = {
                    ...next[idx],
                    flag: url,
                  };
                  updateActiveTabPayload({
                    international_presence: {
                      ...(getActiveTabPayload().international_presence || {}),
                      items: next,
                    },
                  });
                }}
                context={`demographics/international-flag-${idx}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const next = (
                    getActiveTabPayload().international_presence?.items || []
                  ).filter((_: any, i: number) => i !== idx);
                  updateActiveTabPayload({
                    international_presence: {
                      ...(getActiveTabPayload().international_presence || {}),
                      items: next,
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

      {/* National Presence */}
      <div className="space-y-3 border rounded-lg p-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold">National Presence</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const items =
                getActiveTabPayload().national_presence?.items || [];
              updateActiveTabPayload({
                national_presence: {
                  ...(getActiveTabPayload().national_presence || {}),
                  items: [...items, { state: "", percent: "" }],
                },
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add State
          </Button>
        </div>
        <PercentTotalBadge
          items={getActiveTabPayload().national_presence?.items || []}
        />
        {(getActiveTabPayload().national_presence?.items || []).map(
          (item: any, idx: number) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input
                className="flex-1"
                placeholder="State (e.g. Kerala)"
                value={item.state || ""}
                onChange={(e) => {
                  const next = [
                    ...(getActiveTabPayload().national_presence?.items || []),
                  ];
                  next[idx] = {
                    ...next[idx],
                    state: e.target.value,
                  };
                  updateActiveTabPayload({
                    national_presence: {
                      ...(getActiveTabPayload().national_presence || {}),
                      items: next,
                    },
                  });
                }}
              />
              <Input
                type="number"
                className="w-24"
                placeholder="% e.g. 42"
                value={item.percent ?? ""}
                onChange={(e) => {
                  const next = [
                    ...(getActiveTabPayload().national_presence?.items || []),
                  ];
                  next[idx] = {
                    ...next[idx],
                    percent: e.target.value,
                  };
                  updateActiveTabPayload({
                    national_presence: {
                      ...(getActiveTabPayload().national_presence || {}),
                      items: next,
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
                    getActiveTabPayload().national_presence?.items || []
                  ).filter((_: any, i: number) => i !== idx);
                  updateActiveTabPayload({
                    national_presence: {
                      ...(getActiveTabPayload().national_presence || {}),
                      items: next,
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
  );
}
