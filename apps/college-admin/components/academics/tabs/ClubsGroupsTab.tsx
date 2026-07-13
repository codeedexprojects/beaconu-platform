"use client";

import { Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ClubsGroupsTab({
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
        <Label className="block font-bold">Clubs & Associations</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const next = [
              ...(getActiveTabPayload().clubs || []),
              {
                id: "",
                name: "",
                category: "",
                cover_image: "",
                logo: "",
                details: {
                  about: "",
                  mission: "",
                  key_activities: [],
                  recent_events: {
                    happenings_link: "",
                    events: [],
                  },
                },
              },
            ];
            updateActiveTabPayload({ clubs: next });
          }}
        >
          Add Club
        </Button>
      </div>
      {(getActiveTabPayload().clubs || []).map((c: any, idx: number) => {
        const clubs = getActiveTabPayload().clubs || [];
        const updateClub = (patch: any) => {
          const next = [...clubs];
          next[idx] = { ...next[idx], ...patch };
          updateActiveTabPayload({ clubs: next });
        };
        const updateDetails = (patch: any) => {
          updateClub({
            details: { ...c.details, ...patch },
          });
        };
        const keyActivities = c.details?.key_activities || [];
        const events = c.details?.recent_events?.events || [];

        return (
          <div
            key={idx}
            className="space-y-3 border p-4 rounded-lg bg-muted/10"
          >
            <div className="flex justify-between items-start gap-2">
              <Input
                className="flex-1"
                placeholder="Club Name (e.g. National Service Scheme)"
                value={c.name || ""}
                onChange={(e) => updateClub({ name: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const next = clubs.filter((_: any, i: number) => i !== idx);
                  updateActiveTabPayload({
                    clubs: next,
                  });
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Category
                </Label>
                <Input
                  placeholder="Category (e.g. SERVICE)"
                  value={c.category || ""}
                  onChange={(e) =>
                    updateClub({
                      category: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Cover Image URL (banner shown on club page)
                </Label>
                <Input
                  placeholder="https://cdn.example.com/cover.png"
                  value={c.cover_image || ""}
                  onChange={(e) =>
                    updateClub({
                      cover_image: e.target.value,
                    })
                  }
                />
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingField === `club_cover_image_${idx}`}
                  onChange={(e) =>
                    handleCourseFieldUpload(
                      e.target.files?.[0] ?? null,
                      `club_cover_image_${idx}`,
                      `clubs/${idx}/cover_image`,
                      (url) => updateClub({ cover_image: url }),
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
                  value={c.logo || ""}
                  onChange={(e) => updateClub({ logo: e.target.value })}
                />
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingField === `club_logo_${idx}`}
                  onChange={(e) =>
                    handleCourseFieldUpload(
                      e.target.files?.[0] ?? null,
                      `club_logo_${idx}`,
                      `clubs/${idx}/logo`,
                      (url) => updateClub({ logo: url }),
                    )
                  }
                />
              </div>
            </div>

            <Textarea
              placeholder="About this club..."
              value={c.details?.about || ""}
              onChange={(e) => updateDetails({ about: e.target.value })}
            />
            <Textarea
              placeholder="Mission statement..."
              value={c.details?.mission || ""}
              onChange={(e) =>
                updateDetails({
                  mission: e.target.value,
                })
              }
            />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">Key Activities</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateDetails({
                      key_activities: [...keyActivities, ""],
                    })
                  }
                >
                  Add Activity
                </Button>
              </div>
              {keyActivities.map((item: string, kIdx: number) => (
                <div key={kIdx} className="flex gap-2 items-center">
                  <Input
                    placeholder="e.g. Blood Donation Camps"
                    value={item}
                    onChange={(e) => {
                      const next = [...keyActivities];
                      next[kIdx] = e.target.value;
                      updateDetails({
                        key_activities: next,
                      });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      updateDetails({
                        key_activities: keyActivities.filter(
                          (_: any, i: number) => i !== kIdx,
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
              <Label className="text-sm font-semibold">Recent Events</Label>
              <Input
                placeholder="'View Happenings' link"
                value={c.details?.recent_events?.happenings_link || ""}
                onChange={(e) =>
                  updateDetails({
                    recent_events: {
                      ...c.details?.recent_events,
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
                      recent_events: {
                        ...c.details?.recent_events,
                        events: [
                          ...events,
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
                  Add Event
                </Button>
              </div>
              {events.map((event: any, eIdx: number) => {
                const updateEvent = (patch: any) => {
                  const next = [...events];
                  next[eIdx] = {
                    ...next[eIdx],
                    ...patch,
                  };
                  updateDetails({
                    recent_events: {
                      ...c.details?.recent_events,
                      events: next,
                    },
                  });
                };
                return (
                  <div
                    key={eIdx}
                    className="grid grid-cols-[2fr_2fr_2fr_auto] gap-2 items-center"
                  >
                    <Input
                      placeholder="Event Title"
                      value={event.title || ""}
                      onChange={(e) =>
                        updateEvent({
                          title: e.target.value,
                        })
                      }
                    />
                    <div className="space-y-1">
                      <Input
                        placeholder="Thumbnail image URL"
                        value={event.image || ""}
                        onChange={(e) =>
                          updateEvent({
                            image: e.target.value,
                          })
                        }
                      />
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={
                          uploadingField === `club_event_image_${idx}_${eIdx}`
                        }
                        onChange={(e) =>
                          handleCourseFieldUpload(
                            e.target.files?.[0] ?? null,
                            `club_event_image_${idx}_${eIdx}`,
                            `clubs/${idx}/events/${eIdx}`,
                            (url) => updateEvent({ image: url }),
                          )
                        }
                      />
                    </div>
                    <Input
                      placeholder="Event link"
                      value={event.link || ""}
                      onChange={(e) =>
                        updateEvent({
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
                          recent_events: {
                            ...c.details?.recent_events,
                            events: events.filter(
                              (_: any, i: number) => i !== eIdx,
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
