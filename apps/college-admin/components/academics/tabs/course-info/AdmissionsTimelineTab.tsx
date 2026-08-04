"use client";

import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdmissionsTimelineTab({
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
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-foreground">Admission Batches</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const next = [
                ...(getActiveTabPayload().admission_batches || []),
                {
                  label: "",
                  status: "upcoming",
                  banner: {
                    enabled: true,
                    tag: "",
                    message: "",
                    progress_percentage: 0,
                  },
                },
              ];
              updateActiveTabPayload({
                admission_batches: next,
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Batch
          </Button>
        </div>
        {(getActiveTabPayload().admission_batches || []).map(
          (batch: any, idx: number) => (
            <div
              key={idx}
              className="border p-4 rounded-lg space-y-3 bg-muted/5"
            >
              <div className="grid gap-3 grid-cols-3">
                <div>
                  <Label className="text-xs">Label</Label>
                  <Input
                    placeholder="e.g. Admissions 2025"
                    value={batch.label || ""}
                    onChange={(e) => {
                      const next = [
                        ...(getActiveTabPayload().admission_batches || []),
                      ];
                      next[idx] = {
                        ...next[idx],
                        label: e.target.value,
                      };
                      updateActiveTabPayload({
                        admission_batches: next,
                      });
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select
                    value={batch.status || "upcoming"}
                    onValueChange={(val) => {
                      const next = [
                        ...(getActiveTabPayload().admission_batches || []),
                      ];
                      next[idx] = {
                        ...next[idx],
                        status: val,
                      };
                      updateActiveTabPayload({
                        admission_batches: next,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const next = (
                        getActiveTabPayload().admission_batches || []
                      ).filter((_: any, i: number) => i !== idx);
                      updateActiveTabPayload({
                        admission_batches: next,
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="border-t pt-3 space-y-2">
                <h5 className="font-semibold text-xs">Banner Settings</h5>
                <div className="grid gap-2 grid-cols-4">
                  <div>
                    <Label className="text-xs">Tag</Label>
                    <Input
                      placeholder="e.g. ADMISSIONS OPEN"
                      value={batch.banner?.tag || ""}
                      onChange={(e) => {
                        const next = [
                          ...(getActiveTabPayload().admission_batches || []),
                        ];
                        next[idx] = {
                          ...next[idx],
                          banner: {
                            ...(next[idx].banner || {}),
                            tag: e.target.value,
                          },
                        };
                        updateActiveTabPayload({
                          admission_batches: next,
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Message</Label>
                    <Input
                      placeholder="e.g. Limited seats..."
                      value={batch.banner?.message || ""}
                      onChange={(e) => {
                        const next = [
                          ...(getActiveTabPayload().admission_batches || []),
                        ];
                        next[idx] = {
                          ...next[idx],
                          banner: {
                            ...(next[idx].banner || {}),
                            message: e.target.value,
                          },
                        };
                        updateActiveTabPayload({
                          admission_batches: next,
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Progress %</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 90"
                      value={batch.banner?.progress_percentage ?? ""}
                      onChange={(e) => {
                        const next = [
                          ...(getActiveTabPayload().admission_batches || []),
                        ];
                        next[idx] = {
                          ...next[idx],
                          banner: {
                            ...(next[idx].banner || {}),
                            progress_percentage: e.target.value
                              ? e.target.value
                              : 0,
                          },
                        };
                        updateActiveTabPayload({
                          admission_batches: next,
                        });
                      }}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <input
                      type="checkbox"
                      checked={batch.banner?.enabled || false}
                      onChange={(e) => {
                        const next = [
                          ...(getActiveTabPayload().admission_batches || []),
                        ];
                        next[idx] = {
                          ...next[idx],
                          banner: {
                            ...(next[idx].banner || {}),
                            enabled: e.target.checked,
                          },
                        };
                        updateActiveTabPayload({
                          admission_batches: next,
                        });
                      }}
                      className="w-4 h-4"
                    />
                    <Label className="text-xs cursor-pointer">Enabled</Label>
                  </div>
                </div>
              </div>
            </div>
          ),
        )}
      </div>

      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <div>
            <Label className="font-bold">Key Dates</Label>
            <p className="text-xs text-muted-foreground">Title</p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Title"
              className="w-60"
              value={getActiveTabPayload().keyDates?.title || ""}
              onChange={(e) =>
                updateActiveTabPayload({
                  keyDates: {
                    ...(getActiveTabPayload().keyDates || {}),
                    title: e.target.value,
                  },
                })
              }
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const next = [
                  ...(getActiveTabPayload().keyDates?.items || []),
                  {
                    date: "",
                    label: "",
                    status: "",
                  },
                ];
                updateActiveTabPayload({
                  keyDates: {
                    ...(getActiveTabPayload().keyDates || {}),
                    items: next,
                  },
                });
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Date
            </Button>
          </div>
        </div>
        {(getActiveTabPayload().keyDates?.items || []).map(
          (kd: any, idx: number) => (
            <div
              key={idx}
              className="border p-3 rounded-lg space-y-2 bg-muted/5"
            >
              <div className="grid gap-2 grid-cols-4">
                <Input
                  type="date"
                  value={kd.date || ""}
                  onChange={(e) => {
                    const next = [
                      ...(getActiveTabPayload().keyDates?.items || []),
                    ];
                    next[idx] = {
                      ...next[idx],
                      date: e.target.value,
                    };
                    updateActiveTabPayload({
                      keyDates: {
                        ...(getActiveTabPayload().keyDates || {}),
                        items: next,
                      },
                    });
                  }}
                  className="col-span-1"
                />
                <Input
                  placeholder="Label"
                  value={kd.label || ""}
                  onChange={(e) => {
                    const next = [
                      ...(getActiveTabPayload().keyDates?.items || []),
                    ];
                    next[idx] = {
                      ...next[idx],
                      label: e.target.value,
                    };
                    updateActiveTabPayload({
                      keyDates: {
                        ...(getActiveTabPayload().keyDates || {}),
                        items: next,
                      },
                    });
                  }}
                  className="col-span-1"
                />
                <Select
                  value={kd.status || ""}
                  onValueChange={(value) => {
                    const next = [
                      ...(getActiveTabPayload().keyDates?.items || []),
                    ];
                    next[idx] = {
                      ...next[idx],
                      status: value,
                    };
                    updateActiveTabPayload({
                      keyDates: {
                        ...(getActiveTabPayload().keyDates || {}),
                        items: next,
                      },
                    });
                  }}
                >
                  <SelectTrigger className="col-span-1">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="col-span-1"
                  onClick={() => {
                    const next = (
                      getActiveTabPayload().keyDates?.items || []
                    ).filter((_: any, i: number) => i !== idx);
                    updateActiveTabPayload({
                      keyDates: {
                        ...(getActiveTabPayload().keyDates || {}),
                        items: next,
                      },
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
