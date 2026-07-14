"use client";

import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CLASS_TIMING_DAYS } from "@/components/academics/constants";

export function FacilitiesTimingsTab({
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

  return (
    <div className="space-y-6">
      {/* Class Timings — fixed day rows */}
      <div className="space-y-3">
        <Label className="font-bold">Class Timings</Label>
        <div className="space-y-2">
          {CLASS_TIMING_DAYS.map((day) => {
            const timings = getActiveTabPayload().class_timings || [];
            const entry = timings.find((t: any) => t?.day === day) || {
              day,
              closed: false,
              start: "",
              end: "",
            };
            const updateDay = (patch: Record<string, unknown>) => {
              const next = CLASS_TIMING_DAYS.map((d) => {
                const existing = timings.find((t: any) => t?.day === d) || {
                  day: d,
                  closed: false,
                  start: "",
                  end: "",
                };
                return d === day ? { ...existing, ...patch } : existing;
              });
              updateActiveTabPayload({
                class_timings: next,
              });
            };
            return (
              <div
                key={day}
                className="flex flex-wrap items-center gap-3 border p-2 rounded-lg bg-muted/5"
              >
                <span className="w-24 text-sm font-medium">{day}</span>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={!!entry.closed}
                    onChange={(e) =>
                      updateDay({
                        closed: e.target.checked,
                      })
                    }
                  />
                  Closed
                </label>
                {!entry.closed && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      className="w-32"
                      value={entry.start || ""}
                      onChange={(e) =>
                        updateDay({
                          start: e.target.value,
                        })
                      }
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <Input
                      type="time"
                      className="w-32"
                      value={entry.end || ""}
                      onChange={(e) =>
                        updateDay({
                          end: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Industry Tools Array */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Industry Tools</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const next = [
                ...(getActiveTabPayload().industry_tools || []),
                "",
              ];
              updateActiveTabPayload({
                industry_tools: next,
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Industry Tool
          </Button>
        </div>
        {(getActiveTabPayload().industry_tools || []).map(
          (tool: string, idx: number) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input
                placeholder="e.g. Python, Docker, Tableau"
                value={tool || ""}
                onChange={(e) => {
                  const next = [
                    ...(getActiveTabPayload().industry_tools || []),
                  ];
                  next[idx] = e.target.value;
                  updateActiveTabPayload({
                    industry_tools: next,
                  });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const next = (
                    getActiveTabPayload().industry_tools || []
                  ).filter((_: any, i: number) => i !== idx);
                  updateActiveTabPayload({
                    industry_tools: next,
                  });
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ),
        )}
      </div>

      {/* Lab Facilities Array */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Lab Facilities</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const next = [
                ...(getActiveTabPayload().lab_facilities || []),
                "",
              ];
              updateActiveTabPayload({
                lab_facilities: next,
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Lab Facility
          </Button>
        </div>
        {(getActiveTabPayload().lab_facilities || []).map(
          (lab: string, idx: number) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input
                placeholder="e.g. Advanced IoT & Robotics Lab"
                value={lab || ""}
                onChange={(e) => {
                  const next = [
                    ...(getActiveTabPayload().lab_facilities || []),
                  ];
                  next[idx] = e.target.value;
                  updateActiveTabPayload({
                    lab_facilities: next,
                  });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const next = (
                    getActiveTabPayload().lab_facilities || []
                  ).filter((_: any, i: number) => i !== idx);
                  updateActiveTabPayload({
                    lab_facilities: next,
                  });
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ),
        )}
      </div>

      {/* Classroom Facilities Array */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Classroom Facilities</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const next = [
                ...(getActiveTabPayload().classroom_facilities || []),
                "",
              ];
              updateActiveTabPayload({
                classroom_facilities: next,
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Classroom Facility
          </Button>
        </div>
        {(getActiveTabPayload().classroom_facilities || []).map(
          (cr: string, idx: number) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input
                placeholder="e.g. Smart Projector, Centrally Air-Conditioned"
                value={cr || ""}
                onChange={(e) => {
                  const next = [
                    ...(getActiveTabPayload().classroom_facilities || []),
                  ];
                  next[idx] = e.target.value;
                  updateActiveTabPayload({
                    classroom_facilities: next,
                  });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const next = (
                    getActiveTabPayload().classroom_facilities || []
                  ).filter((_: any, i: number) => i !== idx);
                  updateActiveTabPayload({
                    classroom_facilities: next,
                  });
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ),
        )}
      </div>

      {/* Bonus Certification Object */}
      <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
        <h4 className="font-bold text-sm text-foreground">
          Bonus Certification
        </h4>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Title</Label>
            <Input
              placeholder="e.g. Tally Prime Certification"
              value={getActiveTabPayload().bonus_certification?.title || ""}
              onChange={(e) =>
                updateActiveTabPayload({
                  bonus_certification: {
                    ...(getActiveTabPayload().bonus_certification || {}),
                    title: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tag</Label>
            <Input
              placeholder="e.g. BONUS CERTIFICATION"
              value={getActiveTabPayload().bonus_certification?.tag || ""}
              onChange={(e) =>
                updateActiveTabPayload({
                  bonus_certification: {
                    ...(getActiveTabPayload().bonus_certification || {}),
                    tag: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Certification File</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                disabled={uploadingField === "bonus_certification_link"}
                onChange={(e) =>
                  handleCourseFieldUpload(
                    e.target.files?.[0] ?? null,
                    "bonus_certification_link",
                    "bonus-certification/link",
                    (url) =>
                      updateActiveTabPayload({
                        bonus_certification: {
                          ...(getActiveTabPayload().bonus_certification || {}),
                          link: url,
                        },
                      }),
                  )
                }
              />
            </div>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs">Description</Label>
            <Input
              placeholder="e.g. Included with Finance specialization at no extra cost."
              value={
                getActiveTabPayload().bonus_certification?.description || ""
              }
              onChange={(e) =>
                updateActiveTabPayload({
                  bonus_certification: {
                    ...(getActiveTabPayload().bonus_certification || {}),
                    description: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
