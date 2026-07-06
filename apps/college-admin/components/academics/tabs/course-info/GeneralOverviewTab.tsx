"use client";

import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function GeneralOverviewTab({
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
      <div className="space-y-2">
        <Label>Course Info Name</Label>
        <Input
          placeholder="e.g. MBA Digital Transformation"
          value={getActiveTabPayload().name || ""}
          onChange={(e) =>
            updateActiveTabPayload({
              name: e.target.value,
            })
          }
        />
      </div>

      {/* Quick Info - Key-Value pairs */}
      <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-sm text-foreground">Quick Info</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const next = [
                ...(getActiveTabPayload().quick_info || []),
                { label: "", value: "" },
              ];
              updateActiveTabPayload({
                quick_info: next,
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        {(getActiveTabPayload().quick_info || []).map(
          (item: any, idx: number) => (
            <div key={idx} className="grid gap-2 grid-cols-12 items-center">
              <Input
                placeholder="Label (e.g. DURATION)"
                value={item.label || ""}
                className="col-span-5"
                onChange={(e) => {
                  const next = [...(getActiveTabPayload().quick_info || [])];
                  next[idx] = {
                    ...next[idx],
                    label: e.target.value,
                  };
                  updateActiveTabPayload({
                    quick_info: next,
                  });
                }}
              />
              <Input
                placeholder="Value (e.g. 24 months)"
                value={item.value || ""}
                className="col-span-6"
                onChange={(e) => {
                  const next = [...(getActiveTabPayload().quick_info || [])];
                  next[idx] = {
                    ...next[idx],
                    value: e.target.value,
                  };
                  updateActiveTabPayload({
                    quick_info: next,
                  });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="col-span-1"
                onClick={() => {
                  const next = (getActiveTabPayload().quick_info || []).filter(
                    (_: any, i: number) => i !== idx,
                  );
                  updateActiveTabPayload({
                    quick_info: next,
                  });
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ),
        )}
      </div>

      {/* Highlights */}
      <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
        <div className="flex justify-between items-center">
          <div>
            <Label className="font-bold text-sm">Highlights</Label>
            <p className="text-xs text-muted-foreground">Title</p>
          </div>
          <Input
            placeholder="e.g. Program Highlights"
            className="w-60"
            value={getActiveTabPayload().highlights?.title || ""}
            onChange={(e) =>
              updateActiveTabPayload({
                highlights: {
                  ...(getActiveTabPayload().highlights || {}),
                  title: e.target.value,
                },
              })
            }
          />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Label className="text-xs font-semibold">Items</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const next = [
                ...(getActiveTabPayload().highlights?.items || []),
                { text: "" },
              ];
              updateActiveTabPayload({
                highlights: {
                  ...(getActiveTabPayload().highlights || {}),
                  items: next,
                },
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Highlight
          </Button>
        </div>
        {(getActiveTabPayload().highlights?.items || []).map(
          (item: any, idx: number) => (
            <div key={idx} className="flex gap-2 items-start">
              <Textarea
                placeholder="Highlight text"
                rows={2}
                value={item.text || ""}
                onChange={(e) => {
                  const next = [
                    ...(getActiveTabPayload().highlights?.items || []),
                  ];
                  next[idx] = {
                    ...next[idx],
                    text: e.target.value,
                  };
                  updateActiveTabPayload({
                    highlights: {
                      ...(getActiveTabPayload().highlights || {}),
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
                    getActiveTabPayload().highlights?.items || []
                  ).filter((_: any, i: number) => i !== idx);
                  updateActiveTabPayload({
                    highlights: {
                      ...(getActiveTabPayload().highlights || {}),
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

      {/* Accreditations */}
      <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
        <div className="flex justify-between items-center">
          <div>
            <Label className="font-bold text-sm">Accreditations</Label>
            <p className="text-xs text-muted-foreground">Title</p>
          </div>
          <Input
            placeholder="e.g. Course Accolades"
            className="w-60"
            value={getActiveTabPayload().accreditations?.title || ""}
            onChange={(e) =>
              updateActiveTabPayload({
                accreditations: {
                  ...(getActiveTabPayload().accreditations || {}),
                  title: e.target.value,
                },
              })
            }
          />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Label className="text-xs font-semibold">Items</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const next = [
                ...(getActiveTabPayload().accreditations?.items || []),
                {
                  tag: "",
                  image: "",
                  document: "",
                  title: "",
                },
              ];
              updateActiveTabPayload({
                accreditations: {
                  ...(getActiveTabPayload().accreditations || {}),
                  items: next,
                },
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        {(getActiveTabPayload().accreditations?.items || []).map(
          (item: any, idx: number) => (
            <div key={idx} className="space-y-2 pt-2 pb-4 border-b">
              <div className="grid gap-2 grid-cols-2">
                <div>
                  <Label className="text-xs">Tag</Label>
                  <Input
                    placeholder="e.g. MAHE Rank 3"
                    value={item.tag || ""}
                    onChange={(e) => {
                      const next = [
                        ...(getActiveTabPayload().accreditations?.items || []),
                      ];
                      next[idx] = {
                        ...next[idx],
                        tag: e.target.value,
                      };
                      updateActiveTabPayload({
                        accreditations: {
                          ...(getActiveTabPayload().accreditations || {}),
                          items: next,
                        },
                      });
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">Image (Upload or URL)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Image URL"
                      value={item.image || ""}
                      onChange={(e) => {
                        const next = [
                          ...(getActiveTabPayload().accreditations?.items ||
                            []),
                        ];
                        next[idx] = {
                          ...next[idx],
                          image: e.target.value,
                        };
                        updateActiveTabPayload({
                          accreditations: {
                            ...(getActiveTabPayload().accreditations || {}),
                            items: next,
                          },
                        });
                      }}
                    />
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      disabled={uploadingField === `accreditation_image_${idx}`}
                      onChange={(e) =>
                        handleCourseFieldUpload(
                          e.target.files?.[0] ?? null,
                          `accreditation_image_${idx}`,
                          `accreditations/image_${idx}`,
                          (url) => {
                            const next = [
                              ...(getActiveTabPayload().accreditations?.items ||
                                []),
                            ];
                            next[idx] = {
                              ...next[idx],
                              image: url,
                            };
                            updateActiveTabPayload({
                              accreditations: {
                                ...(getActiveTabPayload().accreditations || {}),
                                items: next,
                              },
                            });
                          },
                        )
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">
                    Certificate (Upload PDF or URL)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Document URL"
                      value={item.document || ""}
                      onChange={(e) => {
                        const next = [
                          ...(getActiveTabPayload().accreditations?.items ||
                            []),
                        ];
                        next[idx] = {
                          ...next[idx],
                          document: e.target.value,
                        };
                        updateActiveTabPayload({
                          accreditations: {
                            ...(getActiveTabPayload().accreditations || {}),
                            items: next,
                          },
                        });
                      }}
                    />
                    <Input
                      type="file"
                      accept="application/pdf"
                      disabled={uploadingField === `accreditation_doc_${idx}`}
                      onChange={(e) =>
                        handleCourseFieldUpload(
                          e.target.files?.[0] ?? null,
                          `accreditation_doc_${idx}`,
                          `accreditations/document_${idx}`,
                          (url) => {
                            const next = [
                              ...(getActiveTabPayload().accreditations?.items ||
                                []),
                            ];
                            next[idx] = {
                              ...next[idx],
                              document: url,
                            };
                            updateActiveTabPayload({
                              accreditations: {
                                ...(getActiveTabPayload().accreditations || {}),
                                items: next,
                              },
                            });
                          },
                        )
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Title</Label>
                  <Input
                    placeholder="e.g. India's top #131"
                    value={item.title || ""}
                    onChange={(e) => {
                      const next = [
                        ...(getActiveTabPayload().accreditations?.items || []),
                      ];
                      next[idx] = {
                        ...next[idx],
                        title: e.target.value,
                      };
                      updateActiveTabPayload({
                        accreditations: {
                          ...(getActiveTabPayload().accreditations || {}),
                          items: next,
                        },
                      });
                    }}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const next = (
                    getActiveTabPayload().accreditations?.items || []
                  ).filter((_: any, i: number) => i !== idx);
                  updateActiveTabPayload({
                    accreditations: {
                      ...(getActiveTabPayload().accreditations || {}),
                      items: next,
                    },
                  });
                }}
              >
                <Trash2 className="h-4 w-4 mr-1 text-destructive" />
                Remove
              </Button>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
