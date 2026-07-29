"use client";

import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IconPickerField } from "@/components/icon-picker";

export function GuidelinesTab({
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Banner Tag</Label>
          <Input
            placeholder="e.g. ACADEMIC POLICIES"
            value={getActiveTabPayload().important_guidelines_banner?.tag || ""}
            onChange={(e) =>
              updateActiveTabPayload({
                important_guidelines_banner: {
                  ...(getActiveTabPayload().important_guidelines_banner || {}),
                  tag: e.target.value,
                },
              })
            }
          />
        </div>
        <div className="space-y-1">
          <Label>Background Style</Label>
          <Input
            placeholder="e.g. gradient_orange"
            value={
              getActiveTabPayload().important_guidelines_banner
                ?.background_style || ""
            }
            onChange={(e) =>
              updateActiveTabPayload({
                important_guidelines_banner: {
                  ...(getActiveTabPayload().important_guidelines_banner || {}),
                  background_style: e.target.value,
                },
              })
            }
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>Banner Title</Label>
          <Input
            placeholder="e.g. Important Guidelines"
            value={
              getActiveTabPayload().important_guidelines_banner?.title || ""
            }
            onChange={(e) =>
              updateActiveTabPayload({
                important_guidelines_banner: {
                  ...(getActiveTabPayload().important_guidelines_banner || {}),
                  title: e.target.value,
                },
              })
            }
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>Banner Description</Label>
          <Textarea
            rows={2}
            placeholder="Brief description of the guidelines..."
            value={
              getActiveTabPayload().important_guidelines_banner?.description ||
              ""
            }
            onChange={(e) =>
              updateActiveTabPayload({
                important_guidelines_banner: {
                  ...(getActiveTabPayload().important_guidelines_banner || {}),
                  description: e.target.value,
                },
              })
            }
          />
        </div>
      </div>
      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Academic Policies</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const policies = [
                ...(getActiveTabPayload().important_guidelines_banner
                  ?.academic_policies || []),
                {
                  badge: "",
                  title: "",
                  description: "",
                  read_more_cta: "Read More",
                  read_more_link: "",
                  icon: "",
                },
              ];
              updateActiveTabPayload({
                important_guidelines_banner: {
                  ...(getActiveTabPayload().important_guidelines_banner || {}),
                  academic_policies: policies,
                },
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Policy
          </Button>
        </div>
        {(
          getActiveTabPayload().important_guidelines_banner
            ?.academic_policies || []
        ).map((policy: any, pi: number) => (
          <div key={pi} className="border p-4 rounded-xl space-y-3 bg-muted/5">
            <div className="flex gap-3 items-start">
              <div className="flex-1 grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Badge Text</Label>
                  <Input
                    placeholder="e.g. Required: 75%"
                    value={policy.badge || ""}
                    onChange={(e) => {
                      const policies = [
                        ...(getActiveTabPayload().important_guidelines_banner
                          ?.academic_policies || []),
                      ];
                      policies[pi] = {
                        ...policies[pi],
                        badge: e.target.value,
                      };
                      updateActiveTabPayload({
                        important_guidelines_banner: {
                          ...(getActiveTabPayload()
                            .important_guidelines_banner || {}),
                          academic_policies: policies,
                        },
                      });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Policy Title</Label>
                  <Input
                    placeholder="e.g. Minimum Attendance"
                    value={policy.title || ""}
                    onChange={(e) => {
                      const policies = [
                        ...(getActiveTabPayload().important_guidelines_banner
                          ?.academic_policies || []),
                      ];
                      policies[pi] = {
                        ...policies[pi],
                        title: e.target.value,
                      };
                      updateActiveTabPayload({
                        important_guidelines_banner: {
                          ...(getActiveTabPayload()
                            .important_guidelines_banner || {}),
                          academic_policies: policies,
                        },
                      });
                    }}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    rows={2}
                    placeholder="Policy description..."
                    value={policy.description || ""}
                    onChange={(e) => {
                      const policies = [
                        ...(getActiveTabPayload().important_guidelines_banner
                          ?.academic_policies || []),
                      ];
                      policies[pi] = {
                        ...policies[pi],
                        description: e.target.value,
                      };
                      updateActiveTabPayload({
                        important_guidelines_banner: {
                          ...(getActiveTabPayload()
                            .important_guidelines_banner || {}),
                          academic_policies: policies,
                        },
                      });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Read More CTA Text</Label>
                  <Input
                    placeholder="e.g. Read More"
                    value={policy.read_more_cta || ""}
                    onChange={(e) => {
                      const policies = [
                        ...(getActiveTabPayload().important_guidelines_banner
                          ?.academic_policies || []),
                      ];
                      policies[pi] = {
                        ...policies[pi],
                        read_more_cta: e.target.value,
                      };
                      updateActiveTabPayload({
                        important_guidelines_banner: {
                          ...(getActiveTabPayload()
                            .important_guidelines_banner || {}),
                          academic_policies: policies,
                        },
                      });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Read More Link (optional)</Label>
                  <Input
                    placeholder="https://..."
                    value={policy.read_more_link || ""}
                    onChange={(e) => {
                      const policies = [
                        ...(getActiveTabPayload().important_guidelines_banner
                          ?.academic_policies || []),
                      ];
                      policies[pi] = {
                        ...policies[pi],
                        read_more_link: e.target.value,
                      };
                      updateActiveTabPayload({
                        important_guidelines_banner: {
                          ...(getActiveTabPayload()
                            .important_guidelines_banner || {}),
                          academic_policies: policies,
                        },
                      });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Icon (optional)</Label>
                  <IconPickerField
                    value={policy.icon || ""}
                    onChange={(iconUrl) => {
                      const policies = [
                        ...(getActiveTabPayload().important_guidelines_banner
                          ?.academic_policies || []),
                      ];
                      policies[pi] = {
                        ...policies[pi],
                        icon: iconUrl,
                      };
                      updateActiveTabPayload({
                        important_guidelines_banner: {
                          ...(getActiveTabPayload()
                            .important_guidelines_banner || {}),
                          academic_policies: policies,
                        },
                      });
                    }}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const policies = (
                    getActiveTabPayload().important_guidelines_banner
                      ?.academic_policies || []
                  ).filter((_: any, i: number) => i !== pi);
                  updateActiveTabPayload({
                    important_guidelines_banner: {
                      ...(getActiveTabPayload().important_guidelines_banner ||
                        {}),
                      academic_policies: policies,
                    },
                  });
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
