"use client";

import { Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AlliancesTiesTab({
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="block font-bold">
          Industrial & International Partnerships
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const next = [
              ...(getActiveTabPayload().alliances || []),
              {
                id: "",
                name: "",
                cover_image: "",
                logo: "",
                details: {
                  category: "",
                  about: "",
                  collaboration_impact: "",
                  key_focus_areas: [],
                  legal_documents: [],
                  alliance_activities: {
                    happenings_link: "",
                    activities: [],
                  },
                },
              },
            ];
            updateActiveTabPayload({ alliances: next });
          }}
        >
          Add Alliance
        </Button>
      </div>
      {(getActiveTabPayload().alliances || []).map((a: any, idx: number) => {
        const alliances = getActiveTabPayload().alliances || [];
        const updateAlliance = (patch: any) => {
          const next = [...alliances];
          next[idx] = { ...next[idx], ...patch };
          updateActiveTabPayload({ alliances: next });
        };
        const updateDetails = (patch: any) => {
          updateAlliance({
            details: { ...a.details, ...patch },
          });
        };
        const focusAreas = a.details?.key_focus_areas || [];
        const legalDocs = a.details?.legal_documents || [];
        const activities = a.details?.alliance_activities?.activities || [];

        return (
          <div
            key={idx}
            className="space-y-3 border p-4 rounded-lg bg-muted/10"
          >
            <div className="flex justify-between items-start gap-2">
              <Input
                className="flex-1"
                placeholder="Partner Name (e.g. Baby Memorial Hospital)"
                value={a.name || ""}
                onChange={(e) =>
                  updateAlliance({
                    name: e.target.value,
                  })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const next = alliances.filter(
                    (_: any, i: number) => i !== idx,
                  );
                  updateActiveTabPayload({
                    alliances: next,
                  });
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Select
                value={a.details?.category || ""}
                onValueChange={(value) => updateDetails({ category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Industrial Collaboration">
                    Industrial Collaboration
                  </SelectItem>
                  <SelectItem value="Academic & Research">
                    Academic & Research
                  </SelectItem>
                  <SelectItem value="Own Hospital">Own Hospital</SelectItem>
                  <SelectItem value="Government">Government</SelectItem>
                </SelectContent>
              </Select>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Cover Image URL (banner shown on partner page)
                </Label>
                <Input
                  placeholder="https://cdn.example.com/cover.png"
                  value={a.cover_image || ""}
                  onChange={(e) =>
                    updateAlliance({
                      cover_image: e.target.value,
                    })
                  }
                />
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingField === `alliance_cover_image_${idx}`}
                  onChange={(e) =>
                    handleCourseFieldUpload(
                      e.target.files?.[0] ?? null,
                      `alliance_cover_image_${idx}`,
                      `alliances/${idx}/cover_image`,
                      (url) =>
                        updateAlliance({
                          cover_image: url,
                        }),
                    )
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Logo URL (small emblem/icon)
                </Label>
                <Input
                  placeholder="https://cdn.example.com/logo.png"
                  value={a.logo || ""}
                  onChange={(e) =>
                    updateAlliance({
                      logo: e.target.value,
                    })
                  }
                />
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingField === `alliance_logo_${idx}`}
                  onChange={(e) =>
                    handleCourseFieldUpload(
                      e.target.files?.[0] ?? null,
                      `alliance_logo_${idx}`,
                      `alliances/${idx}/logo`,
                      (url) => updateAlliance({ logo: url }),
                    )
                  }
                />
              </div>
            </div>

            <Textarea
              placeholder="About this alliance..."
              value={a.details?.about || ""}
              onChange={(e) => updateDetails({ about: e.target.value })}
            />
            <Textarea
              placeholder="Collaboration impact..."
              value={a.details?.collaboration_impact || ""}
              onChange={(e) =>
                updateDetails({
                  collaboration_impact: e.target.value,
                })
              }
            />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">Key Focus Areas</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateDetails({
                      key_focus_areas: [...focusAreas, ""],
                    })
                  }
                >
                  Add Focus Area
                </Button>
              </div>
              {focusAreas.map((item: string, fIdx: number) => (
                <div key={fIdx} className="flex gap-2 items-center">
                  <Input
                    placeholder="e.g. Clinical Rotations for Nursing Students"
                    value={item}
                    onChange={(e) => {
                      const next = [...focusAreas];
                      next[fIdx] = e.target.value;
                      updateDetails({
                        key_focus_areas: next,
                      });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      updateDetails({
                        key_focus_areas: focusAreas.filter(
                          (_: any, i: number) => i !== fIdx,
                        ),
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">
                  Legal & Documentation
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateDetails({
                      legal_documents: [
                        ...legalDocs,
                        {
                          title: "",
                          url: "",
                        },
                      ],
                    })
                  }
                >
                  Add Document
                </Button>
              </div>
              {legalDocs.map((doc: any, dIdx: number) => {
                const updateDoc = (patch: any) => {
                  const next = [...legalDocs];
                  next[dIdx] = {
                    ...next[dIdx],
                    ...patch,
                  };
                  updateDetails({
                    legal_documents: next,
                  });
                };
                return (
                  <div
                    key={dIdx}
                    className="grid grid-cols-[2fr_2fr_auto] gap-2 items-center"
                  >
                    <Input
                      placeholder="Document Title"
                      value={doc.title || ""}
                      onChange={(e) =>
                        updateDoc({
                          title: e.target.value,
                        })
                      }
                    />
                    <div className="space-y-1">
                      <Input
                        placeholder="Document URL"
                        value={doc.url || ""}
                        onChange={(e) =>
                          updateDoc({
                            url: e.target.value,
                          })
                        }
                      />
                      <Input
                        type="file"
                        accept="application/pdf"
                        disabled={
                          uploadingField === `alliance_legal_doc_${idx}_${dIdx}`
                        }
                        onChange={(e) =>
                          handleCourseFieldUpload(
                            e.target.files?.[0] ?? null,
                            `alliance_legal_doc_${idx}_${dIdx}`,
                            `alliances/${idx}/legal_documents/${dIdx}`,
                            (url) => updateDoc({ url }),
                          )
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateDetails({
                          legal_documents: legalDocs.filter(
                            (_: any, i: number) => i !== dIdx,
                          ),
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Alliance Activities
              </Label>
              <Input
                placeholder="'View Happenings' link"
                value={a.details?.alliance_activities?.happenings_link || ""}
                onChange={(e) =>
                  updateDetails({
                    alliance_activities: {
                      ...a.details?.alliance_activities,
                      happenings_link: e.target.value,
                    },
                  })
                }
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateDetails({
                      alliance_activities: {
                        ...a.details?.alliance_activities,
                        activities: [
                          ...activities,
                          {
                            id: "",
                            title: "",
                            image: "",
                            link: "",
                          },
                        ],
                      },
                    })
                  }
                >
                  Add Activity
                </Button>
              </div>
              {activities.map((act: any, acIdx: number) => {
                const updateActivity = (patch: any) => {
                  const next = [...activities];
                  next[acIdx] = {
                    ...next[acIdx],
                    ...patch,
                  };
                  updateDetails({
                    alliance_activities: {
                      ...a.details?.alliance_activities,
                      activities: next,
                    },
                  });
                };
                return (
                  <div
                    key={acIdx}
                    className="grid grid-cols-[2fr_2fr_2fr_auto] gap-2 items-center"
                  >
                    <Input
                      placeholder="Activity Title"
                      value={act.title || ""}
                      onChange={(e) =>
                        updateActivity({
                          title: e.target.value,
                        })
                      }
                    />
                    <div className="space-y-1">
                      <Input
                        placeholder="Thumbnail image URL"
                        value={act.image || ""}
                        onChange={(e) =>
                          updateActivity({
                            image: e.target.value,
                          })
                        }
                      />
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={
                          uploadingField ===
                          `alliance_activity_image_${idx}_${acIdx}`
                        }
                        onChange={(e) =>
                          handleCourseFieldUpload(
                            e.target.files?.[0] ?? null,
                            `alliance_activity_image_${idx}_${acIdx}`,
                            `alliances/${idx}/activities/${acIdx}`,
                            (url) =>
                              updateActivity({
                                image: url,
                              }),
                          )
                        }
                      />
                    </div>
                    <Input
                      placeholder="Activity link"
                      value={act.link || ""}
                      onChange={(e) =>
                        updateActivity({
                          link: e.target.value,
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateDetails({
                          alliance_activities: {
                            ...a.details?.alliance_activities,
                            activities: activities.filter(
                              (_: any, i: number) => i !== acIdx,
                            ),
                          },
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
